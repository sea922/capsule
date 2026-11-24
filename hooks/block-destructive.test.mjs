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
  'rm -rf ./*',
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
  'mysql -e "drop schema app"',
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
  'docker volume prune',
  'podman volume prune -f',
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
  'docker system prune --volumes',
  'docker volume ls',
  'docker volume rm cache',
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
