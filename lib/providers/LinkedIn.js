const scrapedin = require('@mvegter/scrapedin');
const { logger } = require('../utilities');
const fs = require('fs');

const cleanupProfile = async (rawData) => {
  const data = {};
  for (const key of Object.keys(rawData)) {
    switch (key) {
      case 'positions':
        data.positions = [];
        for (let i = 0; i < rawData.positions.length; i++) {
          const position = rawData.positions[i];
          if (position['roles']) {
            for (let j = 0; j < position.roles.length; j++) {
              const role = position.roles[j];
              data.positions.push({
                title: role.title,
                link: position.link,
                url: position.url,
                companyName: position.title,
                location: role.location,
                description: role.description,
                date1: role.date1,
                date2: role.date2,
              });
            }
          } else {
            data.positions.push(position);
          }
        }
        break;
      default:
        data[key] = rawData[key];
        break;
    }
  }

  if (data.profile?.summary) {
    data.profile.summary = data.profile.summary.replace('...\nsee more', '');
    data.profile.summary = data.profile.summary.replace('…\nsee more', '');
  }

  for (const key of Object.keys(data)) {
    switch (key) {
      case 'positions':
        for (const position of data.positions) {
          if (position.title) {
            position.title = position.title.replace('Titel\n', '');
          }
          if (position.companyName) {
            position.companyName = position.companyName.replace('Bedrijfsnaam\n', '');
            position.companyName = position.companyName.replace('Part-time', '');
            position.companyName = position.companyName.replace('Full-time', '');
            position.companyName = position.companyName.replace('Internship', '');
          }
          if (position.description) {
            position.description = position.description.replace('\nsee less', '');
            position.description = position.description.replace('\nminder weergeven', '');
          }
          if (position.date1) {
            position.date1 = position.date1.replace('heden', 'current');
          }
        }
        break;
      default:
        // Do nothing
        break;
    }
  }

  return data;
};

const scrapeProfile = async (username) => {
  const puppeteerArgs = {};
  if (process.arch === 'arm') {
    puppeteerArgs.executablePath = '/usr/bin/chromium-browser';
  }

  const cacheName = './cache/linkedin';
  try {

    logger.info('LinkedIn | Logging into LinkedIn');
    const profileScraper = await scrapedin({
      email: process.env.LINKEDIN_EMAIL,
      password: process.env.LINKEDIN_PASSWORD,
      puppeteerArgs,
    });
    logger.info('LinkedIn | Crawling profile of: %s', username);
    const rawData = await profileScraper(`https://www.linkedin.com/in/${username}/?locale=en_US`);
    logger.info('LinkedIn | Parsing data of: %s', username);
    const data = await cleanupProfile(rawData);
    logger.info('LinkedIn | Done parsing data of: %s', username);

    if (!fs.existsSync('./cache')) {
      fs.mkdirSync('./cache');
    }
    fs.writeFileSync(cacheName, JSON.stringify(data));

    return data;
  } catch (error) {
    if (fs.existsSync(cacheName)) {
      return JSON.parse(fs.readFileSync(cacheName));
    }
    throw error;
  }
};

module.exports = async () => scrapeProfile('martijnvegter');
