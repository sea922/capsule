import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gitCall, pieces, program, segments, tokens } from './shell-words.mjs';

const commands = (command) => segments(command).map((segment) => segment.trim()).filter(Boolean);

test('tokens joins adjacent quoted and unquoted pieces into one word', () => {
  assert.deepEqual(tokens('rm -rf "$BUILD_DIR"/*'), ['rm', '-rf', '$BUILD_DIR/*']);
  assert.deepEqual(tokens("rm -rf 'build'/"), ['rm', '-rf', 'build/']);
  assert.deepEqual(tokens('rm -rf "$HOME"/.cache/app'), ['rm', '-rf', '$HOME/.cache/app']);
  assert.deepEqual(tokens('git commit -m"fix --no-verify thing"'), ['git', 'commit', '-mfix --no-verify thing']);
  assert.deepEqual(tokens('echo "" x'), ['echo', '', 'x']);
});

test('tokens honours backslash escapes and comments', () => {
  assert.deepEqual(tokens("echo it\\'s fine"), ['echo', "it's", 'fine']);
  assert.deepEqual(tokens('\\rm -rf x'), ['rm', '-rf', 'x']);
  assert.deepEqual(tokens('ls # rm -rf ~'), ['ls']);
  assert.deepEqual(tokens('echo a#b'), ['echo', 'a#b']);
  assert.deepEqual(tokens('echo "a # b"'), ['echo', 'a # b']);
});

test('segments splits on separators outside quotes', () => {
  assert.deepEqual(commands('a; b && c | d\ne || f'), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(commands('echo "a; b" \'c | d\''), ['echo "a; b" \'c | d\'']);
  assert.deepEqual(commands('make 2>&1 | tee log'), ['make 2>&1', 'tee log']);
});

test('segments skips heredoc bodies but not here-strings', () => {
  assert.deepEqual(commands('cat <<EOF > teardown.sh\nterraform destroy -auto-approve\nEOF\necho done'), ['cat <<EOF > teardown.sh', 'echo done']);
  assert.deepEqual(commands("cat > notes.md <<'END'\nrm -rf /\nEND"), ["cat > notes.md <<'END'"]);
  assert.deepEqual(commands('cat <<-EOF\n\trm -rf ~\n\tEOF\nls'), ['cat <<-EOF', 'ls']);
  assert.deepEqual(commands('cat <<< "x"\nrm -rf ~'), ['cat <<< "x"', 'rm -rf ~']);
  assert.deepEqual(commands('x=$((1<<2)); ls'), ['x=$', '1<<2', 'ls']);
});

test('segments joins line continuations, drops comments, and opens subshells', () => {
  assert.deepEqual(tokens(segments('rm -rf \\\n ~')[0]), ['rm', '-rf', '~']);
  assert.deepEqual(commands("# don't do this\nrm -rf ~"), ['rm -rf ~']);
  assert.deepEqual(commands("echo it\\'s; rm -rf ~"), ["echo it\\'s", 'rm -rf ~']);
  assert.deepEqual(commands('(rm -rf ~)'), ['rm -rf ~']);
  assert.deepEqual(commands('echo $(rm -rf ~)'), ['echo $', 'rm -rf ~']);
  assert.deepEqual(commands('echo `rm -rf ~`'), ['echo', 'rm -rf ~']);
  assert.deepEqual(commands('find . \\( -name a \\) -print'), ['find . \\( -name a \\) -print']);
});

test('pieces records the operator before each segment and any heredoc body', () => {
  const parts = pieces('echo x | psql; ls');
  assert.deepEqual(parts.map((part) => [part.text.trim(), part.operator]), [['echo x', null], ['psql', '|'], ['ls', ';']]);
  assert.equal(pieces('psql <<EOF\nselect 1;\nEOF\n')[0].heredoc, 'select 1;\n');
});

test('segments and tokens tolerate input that is not a string', () => {
  assert.deepEqual(segments(5), ['']);
  assert.deepEqual(segments(undefined), ['']);
  assert.deepEqual(tokens(null), []);
});

test('program drops keywords, wrappers, and assignments, and names the program by basename', () => {
  assert.deepEqual(program(['sudo', '-u', 'root', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['/bin/rm', '-rf', 'x']), ['rm', '-rf', 'x']);
  assert.deepEqual(program(['/usr/bin/sudo', '/bin/rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['then', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['{', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['!', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['env', '-u', 'FOO', '-i', 'A=1', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['doas', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['nice', '-n', '10', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['nohup', 'time', 'rm', 'x']), ['rm', 'x']);
  assert.deepEqual(program(['xargs', '-n', '1', 'rm', '-rf']), ['rm', '-rf']);
  assert.deepEqual(program(['FOO=1', 'make']), ['make']);
  assert.deepEqual(program([]), []);
});

test('gitCall finds the subcommand behind wrappers and global options', () => {
  assert.deepEqual(gitCall(tokens('sudo git -C repo -c a=b push -f')), { subcommand: 'push', rest: ['-f'], directory: 'repo' });
  assert.equal(gitCall(tokens('/usr/bin/git status')).subcommand, 'status');
  assert.equal(gitCall(tokens('echo git push')), null);
  assert.equal(gitCall(tokens('git')), null);
});

test('a shift inside arithmetic is not a heredoc, so later commands are still read', () => {
  const texts = segments('x=$((1<<n))\nrm -rf ~\necho done');
  assert.ok(texts.some((text) => text.includes('rm -rf ~')), JSON.stringify(texts));
});
