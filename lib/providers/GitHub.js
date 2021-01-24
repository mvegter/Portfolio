const { graphql } = require('@octokit/graphql');
const { logger } = require('../utilities');

// TODO: Improve this filter mechanism
const EXCLUDE = [
  /Arvoid00\/.*/,
  /DESQOL\/.*/,
  /Hackathon-Panic-Button\/.*/,
  /Martijn-Workspace\/.*/,
  /SoftwareForScience\/.*/,
  /TWILIO-LABS\/OPEN-PIXEL-ART/,
];

const crawl = async (username) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

  logger.info('GitHub | Crawling repositories contributed to of: %s', username);
  const { viewer } = await graphqlWithAuth(`
        {
            viewer {
                repositoriesContributedTo(first: 100, contributionTypes: [COMMIT], privacy: PUBLIC) {
                    nodes {
                        nameWithOwner
                        description
                        url
                        primaryLanguage {
                            name
                        }
                        owner {
                            login
                        }
                        stargazers {
                            totalCount
                        }
                        watchers {
                            totalCount
                        }
                    }
                }
            }
        }
    `);

  let contribs = {};
  for (const repo of viewer.repositoriesContributedTo.nodes) {
    if (repo.primaryLanguage) {
      repo.language = repo.primaryLanguage.name;
    }

    repo.html_url = repo.url;
    repo.full_name = repo.nameWithOwner;
    repo.stargazers_count = repo.stargazers.totalCount;
    repo.forks_count = repo.watchers.totalCount;

    contribs[repo.full_name] = repo;
  }

  logger.info('GitHub | Crawling repositories of: %s', username);
  const data = await graphqlWithAuth(`
        {
            repositoryOwner(login: "${username}") {
                login
                repositories(first: 100, isFork: false, privacy: PUBLIC) {
                    edges {
                        node {
                            nameWithOwner
                            description
                            url
                            primaryLanguage {
                                name
                            }
                            owner {
                                login
                            }
                            stargazers {
                                totalCount
                            }
                            forks {
                                totalCount
                            }
                        }
                    }
                }
            }
        }
    `);

  let repos = {};
  for (const { node: repo } of data.repositoryOwner.repositories.edges) {
    if (repo.primaryLanguage) {
      repo.language = repo.primaryLanguage.name;
    }

    repo.html_url = repo.url;
    repo.full_name = repo.nameWithOwner;
    repo.stargazers_count = repo.stargazers.totalCount;
    repo.forks_count = repo.forks.totalCount;

    if (repo.owner.login !== username) {
      contribs[repo.full_name] = repo;
    } else {
      repos[repo.full_name] = repo;
    }
  }

  repos = Object.values(repos);
  repos = repos.sort((a, b) => a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase()));
  repos = repos.filter((repo) => {
    let match = false;
    for (const filter of EXCLUDE) {
      if (match) {
        continue;
      }
      match = String(repo.full_name).match(filter);
    }

    return !match;
  });

  contribs = Object.values(contribs);
  contribs = contribs.sort((a, b) => a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase()));
  contribs = contribs.filter((repo) => {
    let match = false;
    for (const filter of EXCLUDE) {
      if (match) {
        continue;
      }
      match = String(repo.full_name).match(filter);
    }

    return !match;
  });

  logger.info('GitHub | Done parsing data of: %s', username);
  return {
    repos: repos.filter((v, i, a) => a.indexOf(v) === i),
    contribs: contribs.filter((v, i, a) => a.indexOf(v) === i),
  };
};

module.exports = async (username = 'mvegter') => crawl(username);
