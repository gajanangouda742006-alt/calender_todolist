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


function includeIosAlarmSound() {
  const source = path.join(root, 'assets', 'daysync_alarm.caf');
  const appDir = path.join(iosDir, 'App', 'App');
  const target = path.join(appDir, 'daysync_alarm.caf');
  const projectPath = path.join(iosDir, 'App', 'App.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(source)) throw new Error('Missing assets/daysync_alarm.caf. Keep the supplied DaySync alarm sound asset in the project.');
  if (!fs.existsSync(appDir) || !fs.existsSync(projectPath)) {
    throw new Error('The generated iOS App project is incomplete; cannot add the custom alarm sound.');
  }
  fs.copyFileSync(source, target);

  let project = fs.readFileSync(projectPath, 'utf8');
  const fileRefId = 'D5A7A11A0000000000000001';
  const buildFileId = 'D5A7A11A0000000000000002';
  if (!project.includes(fileRefId)) {
    const fileRef = `\t\t${fileRefId} /* daysync_alarm.caf */ = {isa = PBXFileReference; lastKnownFileType = file; path = daysync_alarm.caf; sourceTree = "<group>"; };\n`;
    const buildFile = `\t\t${buildFileId} /* daysync_alarm.caf in Resources */ = {isa = PBXBuildFile; fileRef = ${fileRefId} /* daysync_alarm.caf */; };\n`;
    project = project.replace('/* End PBXBuildFile section */', `${buildFile}/* End PBXBuildFile section */`);
    project = project.replace('/* End PBXFileReference section */', `${fileRef}/* End PBXFileReference section */`);

    const appGroupPattern = /([A-F0-9]{24} \/\* App \*\/ = \{\s*isa = PBXGroup;\s*children = \()([\s\S]*?)(\);\s*path = App;[\s\S]*?\};)/;
    if (!appGroupPattern.test(project)) {
      throw new Error('Could not locate the iOS App group in project.pbxproj to register the alarm sound.');
    }
    project = project.replace(appGroupPattern, `$1\t\t\t\t${fileRefId} /* daysync_alarm.caf */,\n$2$3`);

    const resourcesPattern = /(\s+[A-F0-9]{24} \/\* Resources \*\/ = \{\s*isa = PBXResourcesBuildPhase;[\s\S]*?files = \()([\s\S]*?)(\);[\s\S]*?\};)/;
    if (!resourcesPattern.test(project)) {
      throw new Error('Could not locate the iOS Resources build phase in project.pbxproj.');
    }
    project = project.replace(resourcesPattern, `$1\t\t\t\t${buildFileId} /* daysync_alarm.caf in Resources */,\n$2$3`);
    fs.writeFileSync(projectPath, project);
  }
  console.log('Added the custom DaySync alarm sound to the iOS app bundle.');
}

includeIosAlarmSound();

console.log('iOS platform prepared. Open ios/App/App.xcworkspace in Xcode on a Mac to sign, build, and install on iPhone.');
