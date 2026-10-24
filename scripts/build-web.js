
const path = require('path');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');

build({
  entryPoints: [path.join(root, 'app.js')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: path.join(root, 'web-app.js'),
})
  .then(() => console.log('Web app bundled successfully: web-app.js'))
  .catch((error) => {
    console.error('Web app bundling failed:', error);
    process.exitCode = 1;
  });
