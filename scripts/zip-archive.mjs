import { readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateRawSync, inflateRawSync } from 'node:zlib';

// Fixed 1980-01-01 timestamp keeps archives byte-identical across runs.
const DOS_TIME = 0;
const DOS_DATE = (1 << 5) | 1;
const DEFLATE = 8;

function localHeader(nameBytes, entry) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(DEFLATE, 8);
  header.writeUInt16LE(DOS_TIME, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(entry.checksum, 14);
  header.writeUInt32LE(entry.compressed.length, 18);
  header.writeUInt32LE(entry.size, 22);
  header.writeUInt16LE(nameBytes.length, 26);
  return Buffer.concat([header, nameBytes]);
}

function centralHeader(nameBytes, entry) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(DEFLATE, 10);
  header.writeUInt16LE(DOS_TIME, 12);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(entry.checksum, 16);
  header.writeUInt32LE(entry.compressed.length, 20);
  header.writeUInt32LE(entry.size, 24);
  header.writeUInt16LE(nameBytes.length, 28);
  header.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([header, nameBytes]);
}

// files: [{ name: 'dir/file.md' (forward slashes), path: absolute source path }]
export function writeZip(zipPath, files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, path } of [...files].sort((left, right) => (left.name < right.name ? -1 : 1))) {
    const content = readFileSync(path);
    const nameBytes = Buffer.from(name, 'utf8');
    const entry = { checksum: crc32(content), compressed: deflateRawSync(content), size: content.length, offset };
    const local = Buffer.concat([localHeader(nameBytes, entry), entry.compressed]);
    locals.push(local);
    centrals.push(centralHeader(nameBytes, entry));
    offset += local.length;
  }
  const central = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(centrals.length, 8);
  end.writeUInt16LE(centrals.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  writeFileSync(zipPath, Buffer.concat([...locals, central, end]));
}

export function readZip(zipPath) {
  const archive = readFileSync(zipPath);
  const end = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = archive.readUInt16LE(end + 10);
  const entries = new Map();
  let cursor = archive.readUInt32LE(end + 16);
  for (let index = 0; index < count; index += 1) {
    const compressedSize = archive.readUInt32LE(cursor + 20);
    const nameLength = archive.readUInt16LE(cursor + 28);
    const extraLength = archive.readUInt16LE(cursor + 30);
    const commentLength = archive.readUInt16LE(cursor + 32);
    const localOffset = archive.readUInt32LE(cursor + 42);
    const name = archive.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    const dataStart = localOffset + 30 + archive.readUInt16LE(localOffset + 26) + archive.readUInt16LE(localOffset + 28);
    entries.set(name, inflateRawSync(archive.subarray(dataStart, dataStart + compressedSize)).toString('utf8'));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
