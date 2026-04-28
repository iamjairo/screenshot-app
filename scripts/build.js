'use strict';

const { spawn } = require('child_process');
const path = require('path');

const platformTargets = {
  darwin: '--mac',
  linux: '--linux',
};

const target = platformTargets[process.platform];

if (!target) {
  console.error(`Unsupported platform for npm run build: ${process.platform}`);
  console.error('Use npm run build:mac or npm run build:linux explicitly instead.');
  process.exit(1);
}

let electronBuilderCli;

try {
  const electronBuilderPackage = require.resolve('electron-builder/package.json');
  electronBuilderCli = path.join(path.dirname(electronBuilderPackage), 'cli.js');
} catch (error) {
  console.error('electron-builder is not installed. Run npm install before building.');
  process.exit(1);
}

const child = spawn(process.execPath, [electronBuilderCli, target], {
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
