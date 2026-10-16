const { exec } = require('child_process');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT, NODE_ENV } = require('./src/config/env');

function openBrowser(url) {
  if (NODE_ENV === 'production') return;
  const command = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command, () => {});
}

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`TECHNOVA: ${url}`);
    console.log(`STORE:    ${url}/`);
    console.log(`LOGIN:    ${url}/login`);
    console.log(`ADMIN:    ${url}/admin`);
    console.log(`API:      ${url}/api`);
    console.log(`HEALTH:   ${url}/health`);
    openBrowser(url);
  });
})();
