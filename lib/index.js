const fs = require('fs');
const path = require('path');
const { generate, logger, minifyDir } = require('./utilities');
const applyProviders = require('./providers');

(async () => {
  const distDir = path.resolve(__dirname, '..', 'dist');
  const srcDir = path.resolve(__dirname, '..', 'src');

  try {
    const config = require('./config');

    await applyProviders(config);
    await generate(srcDir, distDir, config);
    await minifyDir(distDir);

    if (config.cname) {
      logger.info('CNAME | Writing CNAME file...');
      fs.writeFileSync(path.resolve(distDir, 'CNAME'), config.cname);
    }

    process.exit(0);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();
