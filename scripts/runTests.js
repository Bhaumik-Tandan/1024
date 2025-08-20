#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const testCommand = args[0] || 'test';

console.log(`🚀 Running tests with command: ${testCommand}`);

const commands = {
  test: 'jest',
  'test:watch': 'jest --watch',
  'test:coverage': 'jest --coverage',
  'test:verbose': 'jest --verbose',
  'test:update': 'jest --updateSnapshot',
  'test:debug': 'jest --detectOpenHandles --forceExit'
};

const command = commands[testCommand] || commands.test;
const commandArgs = command.split(' ').slice(1);

console.log(`📋 Executing: ${command} ${commandArgs.join(' ')}`);

const jestProcess = spawn('npx', [command, ...commandArgs], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

jestProcess.on('close', (code) => {
  console.log(`\n✨ Tests completed with exit code: ${code}`);
  process.exit(code);
});

jestProcess.on('error', (error) => {
  console.error('❌ Error running tests:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping tests...');
  jestProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping tests...');
  jestProcess.kill('SIGTERM');
});
