#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractRoot = path.join(root, 'contract');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const contractFiles = fs.readdirSync(contractRoot)
  .filter(name => name.endsWith('.md') || name.endsWith('.schema.json'))
  .sort();
const manifestName = 'backend-contract.json';
const docsRelative = path.join('docs', 'backend-contract');
const markerStart = '<!-- backend-contract:start -->';
const markerEnd = '<!-- backend-contract:end -->';
const agentBlock = [
  markerStart,
  '## Backend Contract',
  '',
  'Read docs/backend-contract/AGENT.md and the relevant topic documents before backend design or implementation.',
  'Run the project checks configured in backend-contract.json when requested; do not treat unconfigured or unrun checks as passed.',
  markerEnd,
].join('\n');

function usage() {
  console.log(`Backend Contract v${version}

Usage:
  node bin/contract.mjs create <empty-project-path>
  node bin/contract.mjs adopt <existing-project-path>
  node bin/contract.mjs check <project-path> [--run]
  node bin/contract.mjs review <project-path>
  node bin/contract.mjs update <project-path>

Commands:
  create  Create a language-neutral project skeleton and install the Contract.
  adopt   Install the Contract into an existing project without replacing business files.
  check   Check the installation; project commands run only with --run and explicit manifest entries.
  review  Print read-only project evidence for an Agent; optionally save with --out=<relative-path>.
  update  Update unchanged Contract copies and preserve locally modified documents.
`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const temporary = file + '.backend-contract-' + process.pid + '.tmp';
  fs.writeFileSync(temporary, content, {encoding: 'utf8', flag: 'wx'});
  try {
    fs.renameSync(temporary, file);
  } catch (error) {
    try { fs.rmSync(temporary, {force: true}); } catch {}
    throw error;
  }
}

function writeNew(file, content) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content, {encoding: 'utf8', flag: 'wx'});
}

function copyTree(source, target) {
  fs.mkdirSync(target, {recursive: true});
  for (const entry of fs.readdirSync(source, {withFileTypes: true})) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isSymbolicLink()) throw new Error('模板不允许包含符号链接：' + from);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) writeNew(to, fs.readFileSync(from));
  }
}

function manifestPath(target) {
  return path.join(target, manifestName);
}

function loadManifest(target) {
  const file = manifestPath(target);
  if (!fs.existsSync(file)) throw new Error('项目尚未接入 Backend Contract：' + file);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error('backend-contract.json 不是有效 JSON：' + error.message);
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('backend-contract.json 必须是 JSON 对象。');
  }
  return manifest;
}

function ensureTarget(target, mustBeEmpty) {
  if (!fs.existsSync(target)) {
    if (!mustBeEmpty) throw new Error('目标项目不存在：' + target);
    fs.mkdirSync(target, {recursive: true});
  }
  if (!fs.statSync(target).isDirectory()) throw new Error('目标不是目录：' + target);
  if (mustBeEmpty && fs.readdirSync(target).length > 0) {
    throw new Error('create 只接受空目录；不会覆盖已有项目：' + target);
  }
}

function install(target) {
  const manifest = manifestPath(target);
  const docs = path.join(target, docsRelative);
  if (fs.existsSync(manifest)) throw new Error('项目已经接入；升级请使用 update。');
  if (fs.existsSync(docs) && fs.readdirSync(docs).length > 0) {
    throw new Error('目标目录已有 docs/backend-contract 内容；为避免覆盖，请先人工检查。');
  }

  const agentFile = path.join(target, 'AGENTS.md');
  const existingAgent = fs.existsSync(agentFile) ? fs.readFileSync(agentFile, 'utf8') : '# Agent instructions\n';
  const hasStart = existingAgent.includes(markerStart);
  const hasEnd = existingAgent.includes(markerEnd);
  if (hasStart !== hasEnd) throw new Error('AGENTS.md 中存在不完整的 Backend Contract 标记，请先人工修复。');
  const nextAgent = hasStart ? existingAgent : existingAgent.replace(/\s*$/, '') + '\n\n' + agentBlock + '\n';

  const records = {};
  for (const name of contractFiles) {
    const content = fs.readFileSync(path.join(contractRoot, name), 'utf8');
    records[name] = {version, sha256: sha256(content)};
  }
  const data = {
    $schema: './docs/backend-contract/manifest.schema.json',
    schemaVersion: 1,
    contractVersion: version,
    installedAt: new Date().toISOString(),
    files: records,
    checks: [],
  };

  fs.mkdirSync(docs, {recursive: true});
  try {
    for (const name of contractFiles) {
      writeNew(path.join(docs, name), fs.readFileSync(path.join(contractRoot, name)));
    }
    writeNew(manifest, JSON.stringify(data, null, 2) + '\n');
    atomicWrite(agentFile, nextAgent);
  } catch (error) {
    // Only remove files created by this failed installation; never remove pre-existing project data.
    try { fs.rmSync(docs, {recursive: true, force: true}); } catch {}
    try { fs.rmSync(manifest, {force: true}); } catch {}
    throw error;
  }
  console.log('已安装 Backend Contract：' + target);
  console.log('契约版本：' + version);
  console.log('项目业务代码和既有 AGENTS 内容已保留。');
  console.log('需要集中运行已有检查时，可选配置 checks。');
}

function check(target, {run}) {
  if (!fs.existsSync(manifestPath(target))) {
    console.log('UNVERIFIED  未安装 Contract 或配置项目检查；可直接使用项目已有检查。');
    return;
  }
  const manifest = loadManifest(target);
  const records = manifest.files && typeof manifest.files === 'object' ? manifest.files : {};
  const docs = path.join(target, docsRelative);
  const problems = [];
  let unverified = 0;
  let executed = 0;

  if (!fs.existsSync(path.join(target, 'AGENTS.md')) ||
      !fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8').includes(markerStart)) {
    console.log('UNVERIFIED  AGENTS.md 缺少 Backend Contract 入口');
    unverified++;
  } else {
    console.log('INFO  Agent 入口存在');
  }
  for (const name of contractFiles) {
    const file = path.join(docs, name);
    if (!fs.existsSync(file)) {
      console.log('UNVERIFIED  缺少契约文件：' + name);
      unverified++;
      continue;
    }
    const record = records[name];
    if (!record) {
      console.log('UNVERIFIED  未登记来源版本：' + name);
      unverified++;
      continue;
    }
    const actual = sha256(fs.readFileSync(file));
    if (actual !== record.sha256) {
      console.log('CUSTOMIZED  本地修改，需确认语义仍符合契约：' + name);
    } else if (record.version !== version) {
      console.log('UPDATE AVAILABLE  ' + name + ' 可更新到 ' + version);
    } else {
      console.log('INFO  契约文件：' + name);
    }
  }

  if (manifest.contractVersion !== version) {
    console.log('UPDATE AVAILABLE  项目版本 ' + manifest.contractVersion + '；当前版本 ' + version);
  }

  const checks = manifest.checks ?? [];
  if (!Array.isArray(checks)) throw new Error('checks 必须是数组。');
  if (checks.length === 0) {
    console.log('UNVERIFIED  未配置项目质量检查；CLI 不会猜测或自动执行项目命令。');
    unverified++;
  } else {
    const ids = new Set();
    for (const item of checks) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        problems.push('FAIL  checks 中存在无效条目；每项必须是对象。');
        continue;
      }
      const label = item.name || item.id || 'unnamed-check';
      if (typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)) {
        problems.push('FAIL  检查 id 必须非空且唯一：' + label);
        continue;
      }
      ids.add(item.id);
      if (item.enabled === false) {
        console.log('NOT RUN  已禁用：' + label);
        unverified++;
        continue;
      }
      if (!Array.isArray(item.command) || item.command.length === 0 ||
          item.command.some(part => typeof part !== 'string')) {
        problems.push('FAIL  检查命令必须是非空字符串数组：' + label);
        continue;
      }
      const cwd = path.resolve(target, item.cwd || '.');
      let realTarget;
      let realCwd;
      try {
        realTarget = fs.realpathSync(target);
        realCwd = fs.realpathSync(cwd);
      } catch {
        problems.push('FAIL  检查工作目录不存在：' + label);
        continue;
      }
      if (!inside(realTarget, realCwd) || !fs.statSync(realCwd).isDirectory()) {
        problems.push('FAIL  检查工作目录无效或越界：' + label);
        continue;
      }
      if (!run) {
        console.log('NOT RUN  ' + label + ' — 使用 check --run 执行');
        unverified++;
        continue;
      }
      executed++;
      console.log('\n=== 运行检查：' + label + ' ===');
      const timeoutMs = Number.isInteger(item.timeoutMs) && item.timeoutMs > 0
        ? Math.min(item.timeoutMs, 900000) : 300000;
      const result = spawnSync(item.command[0], item.command.slice(1), {
        cwd,
        stdio: 'inherit',
        timeout: timeoutMs,
        windowsHide: true,
      });
      if (result.error || result.status !== 0) {
        const reason = result.error ? result.error.message : 'exit=' + result.status + (result.signal ? ', signal=' + result.signal : '');
        problems.push('FAIL  ' + label + '：' + reason);
      } else {
        console.log('PASS  ' + label);
      }
    }
  }

  for (const problem of problems) console.error(problem);
  if (problems.length > 0) {
    console.error('\n检查未通过：' + problems.length + ' 个失败项，' + unverified + ' 个未验证项。');
    process.exitCode = 1;
  } else {
    console.log('\n未发现已执行检查失败或无效配置。项目行为检查：' +
      (executed ? '实际执行 ' + executed + ' 项命令' : '未执行项目检查') +
      (unverified ? '；仍有 ' + unverified + ' 项未验证。' : '。'));
  }
}

const ignoredDirectories = new Set([
  '.git', 'node_modules', '.venv', 'venv', '__pycache__', 'vendor',
  'dist', 'build', 'target', 'coverage', '.next', '.nuxt', '.cache',
  '.turbo', '.pytest_cache', '.mypy_cache', '.tox', '.venv-workers',
  'pyodide-venv', 'python_modules', 'site-packages', 'bower_components',
]);
const manifestFiles = new Set([
  'package.json', 'pyproject.toml', 'go.mod', 'Cargo.toml', 'composer.json',
  'pom.xml', 'build.gradle', 'build.gradle.kts', 'requirements.txt', 'Pipfile',
]);
const deployFiles = /^(Dockerfile|docker-compose\..+|compose\..+|wrangler\..+|serverless\..+|fly\.toml|render\.yaml|railway\..+|Procfile|vercel\.json)$/i;

function collectFiles(target) {
  const files = [];
  const directories = [];
  const maxFiles = 12000;
  function visit(dir, depth) {
    if (depth > 7 || files.length >= maxFiles) return;
    let entries;
    try { entries = fs.readdirSync(dir, {withFileTypes: true}); }
    catch { return; }
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(target, absolute).split(path.sep).join('/');
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) continue;
        directories.push(relative);
        visit(absolute, depth + 1);
      } else if (entry.isFile()) {
        files.push(relative);
      }
    }
  }
  visit(target, 0);
  return {files: files.sort(), directories: directories.sort(), truncated: files.length >= maxFiles};
}

function review(target, outputPath) {
  const {files, directories, truncated} = collectFiles(target);
  const group = predicate => files.filter(predicate);
  const manifests = group(file => manifestFiles.has(path.posix.basename(file)));
  const apiSchemas = group(file => /(^|\/)(openapi|swagger)([^/]*\.(json|ya?ml))$/i.test(file));
  const migrations = group(file => /(^|\/)(migrations?|alembic|prisma\/migrations)(\/|$)/i.test(file) && /\.(sql|py|js|ts|json)$/i.test(file));
  const tests = group(file => {
    const parts = file.split('/');
    if (parts.includes('fixtures') || parts.includes('testdata')) return false;
    const name = path.posix.basename(file);
    return /^test[._-].+\.(py|js|mjs|cjs|ts|tsx|go|rs|php)$/i.test(name) ||
      /^test_.+\.py$/i.test(name) ||
      /^.+_test\.(py|go|rs)$/i.test(name) ||
      /\.(test|spec)\.(js|mjs|cjs|ts|tsx)$/i.test(name) ||
      /\.(spec|test)\.py$/i.test(name);
  });
  const ci = group(file => file.startsWith('.github/workflows/') ||
    ['.gitlab-ci.yml', 'Jenkinsfile', 'azure-pipelines.yml', '.circleci/config.yml'].includes(file));
  const deploy = group(file => deployFiles.test(path.posix.basename(file)));
  const observability = group(file => /(otel|opentelemetry|sentry|prometheus|grafana|datadog|telemetry|logging|observability)/i.test(path.posix.basename(file)));
  const migrationsDirs = directories.filter(dir => /(^|\/)(migrations?|alembic)(\/|$)/i.test(dir));

  let scripts = {};
  const packageFile = path.join(target, 'package.json');
  if (fs.existsSync(packageFile)) {
    try { scripts = JSON.parse(fs.readFileSync(packageFile, 'utf8')).scripts || {}; }
    catch { scripts = {__parseError: 'package.json JSON parse failed'}; }
  }
  const candidateCommands = [];
  for (const name of ['lint', 'typecheck', 'check', 'test', 'build']) {
    if (typeof scripts[name] === 'string') candidateCommands.push('npm run ' + name + '（仅发现，不执行）');
  }
  if (files.includes('pyproject.toml')) {
    candidateCommands.push('检查 pyproject.toml 中配置的 pytest / ruff / mypy（仅建议，不执行）');
  }
  if (files.includes('go.mod')) candidateCommands.push('go test ./...、go vet ./...（仅建议，不执行）');
  if (files.includes('Cargo.toml')) candidateCommands.push('cargo test、cargo clippy（仅建议，不执行）');

  const sections = [
    '# Backend Contract 证据采集报告',
    '',
    '> 本报告由 CLI 只读采集项目结构和配置线索，不判断架构正确性，不代表检查已运行或通过。',
    '',
    '- 生成时间：' + new Date().toISOString(),
    '- 项目目录：.',
    '- 文件数量：' + files.length + (truncated ? '（达到采集上限，结果不完整）' : ''),
    '',
    '## 技术栈与工程清单',
    '',
    ...(manifests.length ? manifests.map(file => '- ' + file) : ['- 未发现常见语言/构建清单']),
    '',
    '## API 契约候选',
    '',
    ...(apiSchemas.length ? apiSchemas.map(file => '- ' + file) : [
      '- 未发现静态 OpenAPI / Swagger 文件；若框架运行时生成 schema（例如 FastAPI），需由 Agent 从实际应用入口核实。',
    ]),
    '',
    '## 数据迁移候选',
    '',
    ...(migrations.length ? migrations.map(file => '- ' + file) : ['- 未发现常见 migration 文件']),
    ...(migrationsDirs.length ? migrationsDirs.map(dir => '- 目录：' + dir) : []),
    '',
    '## 测试候选',
    '',
    '- 文件数量：' + tests.length,
    ...(tests.slice(0, 100).map(file => '- ' + file)),
    ...(tests.length > 100 ? ['- 其余 ' + (tests.length - 100) + ' 个测试文件未展开'] : []),
    '',
    '## CI / 发布配置',
    '',
    ...(ci.length ? ci.map(file => '- ' + file) : ['- 未发现常见 CI 配置']),
    ...(deploy.length ? deploy.map(file => '- ' + file) : ['- 未发现常见部署配置']),
    '',
    '## 可观测性配置线索',
    '',
    ...(observability.length ? observability.map(file => '- ' + file) : ['- 未发现名称明显相关的配置文件；不代表项目没有日志或指标']),
    '',
    '## 可能存在的检查命令（只发现，不执行）',
    '',
    ...(candidateCommands.length ? candidateCommands.map(item => '- ' + item) : ['- 未发现可安全推断的命令；请检查项目实际入口']),
    '',
    '## 后续核实',
    '',
    '- 按本次目标、Owner 和 DESIGN-REVIEW.md 的适用原则核实真实代码及行为；文件名只是调查线索。',
    '',
    '## 证据边界',
    '',
    '- 没有读取业务源码或生产数据来推断领域语义。',
    '- 没有执行项目脚本、测试、迁移、部署或生产请求。',
    '- 文件名和目录名只是线索，不构成合规证明。',
  ];
  const report = sections.join('\n') + '\n';
  if (outputPath) {
    const output = path.resolve(target, outputPath);
    if (!inside(target, output)) throw new Error('Review 输出路径必须位于消费者项目内部。');
    fs.mkdirSync(path.dirname(output), {recursive: true});
    if (!inside(fs.realpathSync(target), fs.realpathSync(path.dirname(output)))) {
      throw new Error('Review 输出目录不能通过符号链接逃出消费者项目。');
    }
    writeNew(output, report);
    console.log('已保存 Review 证据：' + path.relative(target, output).split(path.sep).join('/'));
    console.log('文件 ' + files.length + ' 个；测试候选 ' + tests.length + ' 个；API 契约 ' + apiSchemas.length + ' 个；迁移候选 ' + migrations.length + ' 个。');
  } else {
    process.stdout.write(report);
  }
}

function update(target) {
  const manifest = loadManifest(target);
  manifest.files = manifest.files && typeof manifest.files === 'object' && !Array.isArray(manifest.files) ? manifest.files : {};
  manifest.schemaVersion = 1;
  manifest.installedAt ??= new Date().toISOString();
  manifest.checks ??= [];
  if (!Array.isArray(manifest.checks)) throw new Error('checks 必须是数组。');
  const docs = path.join(target, docsRelative);
  const updated = [];
  const preserved = [];
  const added = [];

  for (const name of contractFiles) {
    const source = fs.readFileSync(path.join(contractRoot, name), 'utf8');
    const destination = path.join(docs, name);
    const record = manifest.files[name];
    if (!fs.existsSync(destination)) {
      writeNew(destination, source);
      manifest.files[name] = {version, sha256: sha256(source)};
      added.push(name);
      continue;
    }
    if (record && sha256(fs.readFileSync(destination)) === record.sha256) {
      atomicWrite(destination, source);
      manifest.files[name] = {version, sha256: sha256(source)};
      updated.push(name);
    } else {
      preserved.push(name);
    }
  }

  const retired = [];
  for (const name of ['ACCEPTANCE.md', 'OBSERVABILITY.md']) {
    const destination = path.join(docs, name);
    const record = manifest.files[name];
    if (fs.existsSync(destination)) {
      if (record && sha256(fs.readFileSync(destination)) === record.sha256) {
        fs.rmSync(destination);
        retired.push(name);
      } else {
        preserved.push(name);
      }
    }
    delete manifest.files[name];
  }
  // Delete only the untouched legacy placeholder; retain project-specific facts.
  const baseline = path.join(docs, 'BASELINE.md');
  if (fs.existsSync(baseline)) {
    const content = fs.readFileSync(baseline, 'utf8');
    const emptyLegacy = ['strict', 'incremental'].some(mode => content === [
      '# Backend Contract Baseline', '', '接入模式：' + mode, '',
      '记录已有实现、历史例外、尚未覆盖的检查和暂不适用的规范。',
      '不要把未运行或缺少证据的检查标记为通过。', '',
      '## 已有能力与检查', '', '## 历史例外与已知缺口', '', '## 不适用项及理由', '',
    ].join('\n'));
    if (emptyLegacy) {
      fs.rmSync(baseline);
      retired.push('BASELINE.md');
    } else {
      preserved.push('BASELINE.md');
    }
  }
  delete manifest.mode;
  delete manifest.profile;
  for (const item of manifest.checks) {
    if (item && typeof item === 'object') delete item.required;
  }
  manifest.$schema ??= './docs/backend-contract/manifest.schema.json';
  manifest.contractVersion = version;
  manifest.updatedAt = new Date().toISOString();
  atomicWrite(manifestPath(target), JSON.stringify(manifest, null, 2) + '\n');
  console.log('Contract 更新完成：' + target);
  console.log('移除已废弃且未修改的规范：' + (retired.join(', ') || '无'));
  console.log('已更新：' + (updated.join(', ') || '无'));
  console.log('补齐缺失：' + (added.join(', ') || '无'));
  console.log('保留本地修改/未登记文件：' + (preserved.join(', ') || '无'));
  if (preserved.length) {
    console.log('这些文件没有被覆盖；请人工比较上游变化并确认本地规范仍符合当前版本。');
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    usage();
    return;
  }
  const flags = new Set(args.filter(arg => arg.startsWith('--')));
  const pathArg = args.find(arg => !arg.startsWith('--'));
  const outArg = args.find(arg => arg.startsWith('--out='));
  if (!['create', 'adopt', 'check', 'review', 'update'].includes(command) || !pathArg) {
    usage();
    throw new Error('命令或项目路径无效。');
  }
  if (outArg && !outArg.slice('--out='.length)) throw new Error('--out 需要非空相对路径。');
  const target = path.resolve(pathArg);
  if (command === 'create') {
    ensureTarget(target, true);
    copyTree(path.join(root, 'templates', 'generic-service'), target);
    install(target);
  } else if (command === 'adopt') {
    ensureTarget(target, false);
    install(target);
  } else if (command === 'check') {
    ensureTarget(target, false);
    if (flags.has('--strict')) console.log('提示：旧 --strict 已取消，不再强制合规登记。');
    check(target, {run: flags.has('--run')});
  } else if (command === 'review') {
    ensureTarget(target, false);
    review(target, outArg?.slice('--out='.length));
  } else if (command === 'update') {
    ensureTarget(target, false);
    update(target);
  }
}

try {
  main();
} catch (error) {
  console.error('错误：' + error.message);
  process.exitCode = 1;
}
