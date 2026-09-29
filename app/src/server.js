const http = require('node:http');
const { load } = require('./config');
const { createApp } = require('./app');

const start = (cfg = load()) =>
  new Promise((resolve) => {
    const server = http.createServer(createApp(cfg));
    server.listen(cfg.port, () => resolve(server));
  });

if (require.main === module) {
  const cfg = load();
  start(cfg).then((server) => {
    console.log(`campus-store ${cfg.version} listening on port ${server.address().port}`);
    const stop = () => server.close(() => process.exit(0));
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
  });
}

module.exports = { start };
