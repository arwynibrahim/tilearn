const LoadTestRunner = require('./runner');
const config = require('./config');

const runner = new LoadTestRunner(config);
runner.run().catch(err => {
  console.error('Load test failed:', err);
  process.exit(1);
});
