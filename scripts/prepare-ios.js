'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const iosDir = path.join(root, 'ios');
const plistPath = path.join(iosDir, 'App', 'App', 'Info.plist');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

if (!process.env.SAHRA_API_BASE_URL) {
  throw new Error(
    'Set SAHRA_API_BASE_URL to your deployed HTTPS API origin before preparing the iOS app.'
  );
}

if (!fs.existsSync(path.join(root, 'node_modules', '@capacitor', 'cli'))) {
  throw new Error('Dependencies are not installed. Run npm ci first.');
}

if (!fs.existsSync(iosDir)) {
  console.log('Adding the Capacitor iOS platform...');
  run('npx', ['cap', 'add', 'ios']);
}

console.log('Staging the existing DaySync web app for native use...');
run('npm', ['run', 'mobile:stage']);

console.log('Synchronizing Capacitor iOS plugins and web assets...');
run('npx', ['cap', 'sync', 'ios']);

if (fs.existsSync(plistPath)) {
  let plist = fs.readFileSync(plistPath, 'utf8');
  const permissions = {
    NSLocationWhenInUseUsageDescription:
      'DaySync uses your location to show local weather when you request it.',
    NSSpeechRecognitionUsageDescription:
      'DaySync uses speech recognition when you choose voice input for Sahra.',
    NSMicrophoneUsageDescription:
      'DaySync uses the microphone only when you choose voice input.',
  };

  for (const [key, value] of Object.entries(permissions)) {
    if (plist.includes(`<key>${key}</key>`)) continue;
    const entry = `    <key>${key}</key>\n    <string>${value}</string>\n`;
    const close = plist.lastIndexOf('</dict>');
    if (close < 0) throw new Error('Could not safely update the generated iOS Info.plist.');
    plist = `${plist.slice(0, close)}${entry}${plist.slice(close)}`;
  }
  fs.writeFileSync(plistPath, plist);
  console.log('Added iOS location and voice permission descriptions.');
}

console.log('iOS platform prepared. Open ios/App/App.xcworkspace in Xcode on a Mac to sign, build, and install on iPhone.');
