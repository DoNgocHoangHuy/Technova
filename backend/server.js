const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`TECHNOVA: http://localhost:${PORT}`);
    console.log(`ADMIN:    http://localhost:${PORT}/admin.html`);
  });
})();