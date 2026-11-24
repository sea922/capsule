import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { destructiveReason } from './block-destructive.mjs';

const blocked = [
  'rm -rf /',
  'rm -rf /*',
  'rm -fr ~',
  'rm -rf ~/',
  'rm -r -f "$HOME"',
  'rm -rf ${HOME}/',
  'rm --recursive --force ..',
  'rm -rf *',
  'rm -Rf .',
  'sudo rm -rf /',
  'sudo -E rm -rf --no-preserve-root /',
  'cd build && rm -rf ../',
  'npm test; rm -rf ~',
  'bash -c "rm -rf /"',
  'rm -rf dist ~',
  'git push --force origin main',
  'git push -f origin master',
  'git push -uf origin main',
  'git push origin +main',
  'git push --force origin HEAD:master',
  'git -C repo push --force origin feature:main',
  'psql -c "DROP DATABASE app"',
  'psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"',
  'mysql -e "drop schema if exists app"',
  'echo "DROP SCHEMA reporting CASCADE;" | psql "$DATABASE_URL"',
  'docker exec db psql -U postgres -c "drop database app"',
  'psql <<EOF\nDROP DATABASE app;\nEOF',
  'dropdb production',
  'echo "DROP DATABASE app;" | psql "$DATABASE_URL"',
  'terraform destroy',
  'terraform -chdir=infra destroy -auto-approve',
  'tofu destroy -target=aws_instance.web',
  'terraform apply -destroy',
  'kubectl delete namespace prod',
  'kubectl -n prod delete ns staging',
  'kubectl delete namespace/prod',
  'kubectl delete pods --all',
  'kubectl delete deploy,svc --all -n prod',
  'docker system prune -a --volumes',
  'docker system prune --volumes -af',
  'docker system prune --volumes',
  'docker --context remote volume prune',
  'docker -H tcp://host:2375 volume prune -f',
  'docker volume prune',
  'podman volume prune -f',
  '/bin/rm -rf ~',
  '/usr/bin/rm -rf /',
  '\\rm -rf ~',
  '(rm -rf ~)',
  '{ rm -rf ~; }',
  'if true; then rm -rf ~; fi',
  'for x in 1; do rm -rf ~; done',
  'echo $(rm -rf ~)',
  'echo `rm -rf ~`',
  'rm -rf \\\n ~',
  "echo it\\'s; rm -rf ~",
  "# don't\nrm -rf ~",
  'doas rm -rf /',
  'nice rm -rf ~',
  'env -u FOO rm -rf ~',
  'rm -rf *',
  'rm -rf ./*',
  'rm -rf ./',
  'cd / && rm -rf *',
  'cd ~ && rm -rf ./*',
  'cd "$HOME" && rm -rf *',
  'cd .. && rm -rf *',
  'cd && rm -rf *',
  'cd build && rm -rf ~',
  'git push origin :main',
  'git push --delete origin master',
  'git push -d origin main',
  'bash <<EOF\nrm -rf ~\nEOF',
];

const allowed = [
  'rm -rf node_modules',
  'rm -rf dist build .next',
  'rm -rf ./dist',
  'rm -rf /tmp/scratch-123',
  'rm -rf ~/project/dist',
  'rm -rf "$HOME/.cache/tool"',
  'rm -rf ../sibling/build',
  'rm -f *',
  'rm -r dir',
  'rm *.log',
  'echo rm -rf /',
  'echo "rm -rf ~"',
  'git commit -m "never run rm -rf / here"',
  'grep -r "rm -rf /" docs',
  'git push --force-with-lease origin main',
  'git push --force origin feature/login',
  'git push origin main',
  'git push -f origin fix/main-menu',
  'git reset --hard HEAD~1',
  'git clean -fdx',
  'git commit -m "DROP DATABASE is blocked"',
  'grep -ri "drop database" migrations',
  'psql -c "DROP TABLE tmp_import"',
  'psql -c "select 1"',
  'terraform plan -destroy',
  'terraform apply',
  'echo terraform destroy',
  'kubectl delete pod web-1',
  'kubectl delete -f manifest.yaml',
  'kubectl get namespace prod',
  'kubectl delete pod --all-containers-ish',
  'docker system prune -a',
  'docker volume ls',
  'docker volume rm cache',
  'rm -rf "$BUILD_DIR"/*',
  'rm -rf "$dir"/',
  'rm -rf "${TMP_DIR}"/',
  'rm -rf "$(mktemp -d)"/*',
  'rm -rf -- "$tmp"/*',
  'rm -rf "./dist"/*',
  "rm -rf 'build'/",
  'rm -rf "$HOME"/.cache/myapp',
  'rm -rf "${OUT_DIR:?}"/*',
  'cat <<EOF > teardown.sh\nterraform destroy -auto-approve\nEOF',
  "cat > notes.md <<'EOF'\nnever run rm -rf / or docker volume prune\nEOF",
  'brew install mysql && echo "do not drop database"',
  'createdb x && echo "use DROP DATABASE x later" && psql -l',
  'psql -c "CREATE SCHEMA reporting"',
  'psql -c "select \'drop schema\' as note"',
  'psql -c "COMMENT ON TABLE t IS \'do not drop database\'"',
  'echo "never DROP SCHEMA public" && psql -l',
  'psql -h db.internal -c "select 1"',
  'dropdb --help',
  'kubectl delete pods --all --dry-run=client',
  'kubectl delete namespace prod --dry-run=server',
  'git push --force --dry-run origin main',
  'git push -nf origin main',
  'terraform destroy --help',
  'terraform destroy -h',
  'docker volume prune --help',
  'kubectl delete ns prod -h',
  'cd build && rm -rf ./*',
  'cd /tmp/scratch && rm -rf *',
  'cd "$WORK" && rm -rf .',
  '(cd dist && rm -rf ./)',
  'find . -name "*.tmp" -delete',
  'find . -type d -name node_modules -exec rm -rf {} \\;',
  'git push -f origin feature',
  'git push origin :old-feature',
  'git push --delete origin feature/x',
  'make 2>&1 | tee build.log',
];

test('high-confidence destructive commands are blocked', () => {
  for (const command of blocked) assert.ok(destructiveReason(command), command);
});

test('ordinary commands and quoted text are allowed', () => {
  for (const command of allowed) assert.equal(destructiveReason(command), null, command);
});

test('a bare force push is judged by the current branch', () => {
  assert.ok(destructiveReason('git push --force', () => 'main'));
  assert.ok(destructiveReason('git push -f origin', () => 'master'));
  assert.equal(destructiveReason('git push --force', () => 'feature/x'), null);
  assert.equal(destructiveReason('git push --force', () => null), null);
  assert.equal(destructiveReason('git push', () => 'main'), null);
  assert.ok(destructiveReason('git push -f origin HEAD', () => 'main'));
  assert.equal(destructiveReason('git push -f origin HEAD', () => 'feature/x'), null);
  assert.ok(destructiveReason('git push --force', () => 'main'));
  assert.equal(destructiveReason('git push --force --dry-run', () => 'main'), null);
});

test('the reason tells the agent to hand the command to the user', () => {
  assert.match(destructiveReason('rm -rf /'), /ask the user/i);
});

test('the script blocks with exit 2 and a reason, allows with exit 0, and honours the off switch', () => {
  const script = fileURLToPath(new URL('./block-destructive.mjs', import.meta.url));
  const run = (command, env = {}) => spawnSync(process.execPath, [script], {
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
    encoding: 'utf8', env: { ...process.env, CAPSULE_HOOKS_DISABLED: '', ...env },
  });
  const block = run('docker volume prune');
  assert.equal(block.status, 2);
  assert.match(block.stderr, /block-destructive/);
  assert.equal(run('rm -rf node_modules').status, 0);
  assert.equal(run('docker volume prune', { CAPSULE_HOOKS_DISABLED: 'block-destructive' }).status, 0);
  const otherTool = spawnSync(process.execPath, [script], {
    input: JSON.stringify({ tool_name: 'Write', tool_input: { command: 'rm -rf /' } }), encoding: 'utf8',
  });
  assert.equal(otherTool.status, 0);
  assert.equal(spawnSync(process.execPath, [script], { input: 'not json', encoding: 'utf8' }).status, 0);
});

test('malformed input never blocks or crashes', () => {
  const script = fileURLToPath(new URL('./block-destructive.mjs', import.meta.url));
  for (const input of ['', 'not json', 'null', '5', '[]', '{}', '{"tool_name":"Bash"}', '{"tool_name":"Bash","tool_input":null}',
    '{"tool_name":"Bash","tool_input":{}}', '{"tool_name":"Bash","tool_input":{"command":5}}',
    '{"tool_name":"Bash","tool_input":{"command":["rm","-rf","/"]}}', '{"tool_name":"Bash","tool_input":{"command":"ls"},"cwd":7}']) {
    assert.equal(spawnSync(process.execPath, [script], { input, encoding: 'utf8' }).status, 0, input);
  }
});
