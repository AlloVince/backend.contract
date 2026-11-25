import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'contract.mjs');

function project(t, name = 'project') {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'backend-contract-'));
  t.after(() => fs.rmSync(base, {recursive: true, force: true}));
  const target = path.join(base, name);
  fs.mkdirSync(target, {recursive: true});
  return target;
}

function run(...args) {
  return spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8'});
}

function adopt(t) {
  const target = project(t);
  fs.writeFileSync(path.join(target, 'README.md'), '# Existing project\n');
  fs.writeFileSync(path.join(target, 'AGENTS.md'), '# Existing Agent rules\n\nKeep this content.\n');
  const result = run('adopt', target);
  assert.equal(result.status, 0, result.stderr);
  return target;
}

test('create makes a language-neutral strict skeleton and installs all contract documents', t => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'backend-contract-create-'));
  t.after(() => fs.rmSync(base, {recursive: true, force: true}));
  const target = path.join(base, 'new-service');
  const result = run('create', target);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, 'backend-contract.json'))).mode, 'strict');
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, 'backend-contract.json'))).profile, 'generic-service');
  assert.ok(fs.existsSync(path.join(target, 'src/README.md')));
  assert.ok(fs.existsSync(path.join(target, 'tests/README.md')));
  assert.ok(fs.existsSync(path.join(target, 'owner/PROJECT.md')));
  assert.ok(fs.existsSync(path.join(target, 'docs/backend-contract/GATES.md')));
  const design = fs.readFileSync(path.join(target, 'docs/backend-contract/DESIGN-REVIEW.md'), 'utf8');
  assert.equal([...design.matchAll(/^## DESIGN-0[1-8] /gm)].length, 8);
  assert.match(fs.readFileSync(path.join(target, 'docs/backend-contract/AGENT.md'), 'utf8'), /DESIGN-REVIEW\.md/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, 'backend-contract.json'))).files['DESIGN-REVIEW.md'].version,
    JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version);
  assert.ok(fs.existsSync(path.join(target, 'docs/backend-contract/ACCEPTANCE.md')));
  assert.ok(fs.existsSync(path.join(target, 'docs/backend-contract/manifest.schema.json')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, 'backend-contract.json'))).$schema,
    './docs/backend-contract/manifest.schema.json');
  assert.match(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'), /docs\/backend-contract\/AGENT.md/);
  assert.equal(fs.existsSync(path.join(target, 'package.json')), false, 'generic template must not choose a runtime');
  const check = run('check', target);
  assert.equal(check.status, 1, 'strict new projects must configure and run their checks');
  assert.match(check.stdout + check.stderr, /UNVERIFIED/);
});

test('adopt preserves existing project files and defaults to incremental mode', t => {
  const target = adopt(t);
  assert.equal(fs.readFileSync(path.join(target, 'README.md'), 'utf8'), '# Existing project\n');
  const agent = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  assert.match(agent, /Keep this content/);
  assert.match(agent, /docs\/backend-contract\/AGENT.md/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, 'backend-contract.json'))).mode, 'incremental');
  const check = run('check', target);
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /未配置项目质量检查/);
  assert.match(check.stdout, /未执行/);
});

test('check --run executes only explicitly configured commands and reports failures', t => {
  const target = adopt(t);
  const manifestFile = path.join(target, 'backend-contract.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.checks = [{
    id: 'unit-tests',
    name: 'safe passing fixture',
    command: [process.execPath, '-e', 'process.exit(0)'],
    cwd: '.',
    required: true,
  }];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  const passed = run('check', target, '--run');
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /PASS  safe passing fixture/);

  manifest.checks[0].command = [process.execPath, '-e', 'process.exit(7)'];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  const failed = run('check', target, '--run');
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /FAIL  safe passing fixture/);
});

test('strict check fails until required checks are configured and run', t => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'backend-contract-strict-'));
  t.after(() => fs.rmSync(base, {recursive: true, force: true}));
  const target = path.join(base, 'new-service');
  assert.equal(run('create', target).status, 0);
  const manifestFile = path.join(target, 'backend-contract.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.checks = [{
    id: 'smoke',
    name: 'configured smoke check',
    command: [process.execPath, '-e', 'process.exit(0)'],
    required: true,
  }];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  assert.equal(run('check', target).status, 1, 'configured but unrun check is not a pass');
  const result = run('check', target, '--run');
  assert.equal(result.status, 0, result.stderr);

  manifest.checks = [{
    id: 'optional-only',
    command: [process.execPath, '-e', 'process.exit(0)'],
    required: false,
  }];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  const optionalOnly = run('check', target, '--run', '--strict');
  assert.equal(optionalOnly.status, 1);
  assert.match(optionalOnly.stderr, /至少需要配置一项必需检查/);
});

test('update restores missing files but never overwrites locally modified contract documents', t => {
  const target = adopt(t);
  const docs = path.join(target, 'docs/backend-contract');
  const agentFile = path.join(docs, 'AGENT.md');
  fs.appendFileSync(agentFile, '\nLocal project-specific note.\n');
  fs.rmSync(path.join(docs, 'API.md'));
  const result = run('update', target);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /保留本地修改/);
  assert.match(fs.readFileSync(agentFile, 'utf8'), /Local project-specific note/);
  assert.ok(fs.existsSync(path.join(docs, 'API.md')));
  const check = run('check', target);
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /CUSTOMIZED.*AGENT.md/);
});

test('update installs the design review for legacy consumers while preserving project instructions', t => {
  const target = adopt(t);
  const docs = path.join(target, 'docs/backend-contract');
  const manifestFile = path.join(target, 'backend-contract.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const projectAgent = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  fs.rmSync(path.join(docs, 'DESIGN-REVIEW.md'));
  delete manifest.files['DESIGN-REVIEW.md'];
  manifest.contractVersion = '0.1.0';
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  const result = run('update', target);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /补齐缺失：.*DESIGN-REVIEW.md/);
  assert.equal(fs.readFileSync(path.join(docs, 'DESIGN-REVIEW.md'), 'utf8'),
    fs.readFileSync(path.join(root, 'contract/DESIGN-REVIEW.md'), 'utf8'));
  assert.equal(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'), projectAgent);
  assert.equal(JSON.parse(fs.readFileSync(manifestFile)).contractVersion,
    JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version);
});

test('review collects project evidence without running project commands', t => {
  const target = adopt(t);
  const marker = path.join(target, 'script-must-not-run');
  fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify({
    scripts: {
      test: `node -e "require('fs').writeFileSync('${marker}', 'executed')"`,
      lint: 'eslint .',
    },
  }));
  fs.mkdirSync(path.join(target, 'tests'), {recursive: true});
  fs.writeFileSync(path.join(target, 'tests/example.test.mjs'), 'test("placeholder", () => {});');
  fs.mkdirSync(path.join(target, 'tests/fixtures'), {recursive: true});
  fs.writeFileSync(path.join(target, 'tests/fixtures/test_fixture_data.py'), '');
  fs.mkdirSync(path.join(target, 'src'), {recursive: true});
  fs.writeFileSync(path.join(target, 'src/observability.py'), '');
  fs.mkdirSync(path.join(target, 'migrations'), {recursive: true});
  fs.writeFileSync(path.join(target, 'migrations/001.sql'), 'SELECT 1;');
  fs.writeFileSync(path.join(target, 'openapi.yaml'), 'openapi: 3.1.0\n');
  fs.mkdirSync(path.join(target, '.github/workflows'), {recursive: true});
  fs.writeFileSync(path.join(target, '.github/workflows/ci.yml'), 'name: CI\n');
  fs.mkdirSync(path.join(target, '.venv-workers/lib/site-packages/fake/tests'), {recursive: true});
  fs.writeFileSync(path.join(target, '.venv-workers/lib/site-packages/fake/tests/test_dependency.py'), '');
  fs.mkdirSync(path.join(target, 'python_modules/vendor/tests'), {recursive: true});
  fs.writeFileSync(path.join(target, 'python_modules/vendor/tests/test_vendor.py'), '');
  const preview = run('review', target);
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /# Backend Contract 证据采集报告/);
  assert.equal(fs.existsSync(path.join(target, 'docs/backend-contract/reviews')), false,
    'review without --out must not write into project docs');

  const result = run('review', target, '--out=review-report.md');
  assert.equal(result.status, 0, result.stderr);
  const relative = /已保存 Review 证据：(.+)/.exec(result.stdout)?.[1];
  assert.equal(relative, 'review-report.md', result.stdout);
  const report = fs.readFileSync(path.join(target, relative), 'utf8');
  assert.match(report, /openapi.yaml/);
  assert.match(report, /migrations\/001.sql/);
  assert.match(report, /tests\/example.test.mjs/);
  assert.match(report, /npm run test/);
  assert.match(report, /不执行/);
  assert.doesNotMatch(report, /test_dependency\.py|test_vendor\.py|test_fixture_data\.py/);
  assert.match(report, /测试候选/);
  assert.match(report, /src\/observability\.py/);
  assert.doesNotMatch(report, /项目路径：\/Users\//);
  assert.match(report, /项目目录：\./);
  assert.equal(fs.existsSync(marker), false, 'review must not execute detected package scripts');
  const check = run('check', target);
  assert.equal(check.status, 0, check.stderr);
  assert.equal(fs.existsSync(marker), false, 'check without --run must not execute detected package scripts');
});

test('review output cannot escape the project through a symlink', t => {
  const target = adopt(t);
  const outside = path.join(path.dirname(target), 'outside-review');
  fs.mkdirSync(outside, {recursive: true});
  fs.symlinkSync(outside, path.join(target, 'external'), 'dir');
  const result = run('review', target, '--out=external/report.md');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /输出目录不能通过符号链接逃出/);
  assert.equal(fs.existsSync(path.join(outside, 'report.md')), false);
});

test('adopt and create refuse to overwrite existing project content', t => {
  const target = project(t);
  fs.mkdirSync(path.join(target, 'docs/backend-contract'), {recursive: true});
  fs.writeFileSync(path.join(target, 'docs/backend-contract/AGENT.md'), 'local');
  const result = run('adopt', target);
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(target, 'docs/backend-contract/AGENT.md'), 'utf8'), 'local');
  const create = run('create', target);
  assert.equal(create.status, 1);
});

test('check rejects configured working directories outside the project', t => {
  const target = adopt(t);
  const manifestFile = path.join(target, 'backend-contract.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.checks = [{
    id: 'escape',
    command: [process.execPath, '-e', 'process.exit(0)'],
    cwd: '..',
    required: true,
  }];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  const result = run('check', target, '--run');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /工作目录无效或越界/);
});

test('check resolves symlinks before allowing a configured working directory', t => {
  const target = adopt(t);
  const outside = path.join(path.dirname(target), 'outside-project');
  fs.mkdirSync(outside, {recursive: true});
  fs.symlinkSync(outside, path.join(target, 'external'), 'dir');
  const manifestFile = path.join(target, 'backend-contract.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.checks = [{
    id: 'symlink-escape',
    command: [process.execPath, '-e', 'process.exit(0)'],
    cwd: 'external',
    required: true,
  }];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  const result = run('check', target, '--run');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /工作目录无效或越界/);
});

test('check reports malformed manifest check entries instead of crashing', t => {
  const target = adopt(t);
  const manifestFile = path.join(target, 'backend-contract.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.checks = [null];
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  const result = run('check', target, '--run');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /checks 中存在无效条目/);
});
