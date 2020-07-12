const { graphql } = require('@octokit/graphql');

// TODO: Improve this filter mechanism
const EXCLUDE = [
];

const crawl = async (username) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

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

  let contribs = [];
  for (const repo of viewer.repositoriesContributedTo.nodes) {
    if (repo.primaryLanguage) {
      repo.language = repo.primaryLanguage.name;
    }

    repo.html_url = repo.url;
    repo.full_name = repo.nameWithOwner;
    repo.stargazers_count = repo.stargazers.totalCount;
    repo.forks_count = repo.watchers.totalCount;

    contribs.push(repo);
  }

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

  let repos = [];
  for (const { node: repo } of data.repositoryOwner.repositories.edges) {
    if (repo.owner.login !== username) {
      continue;
    }
    if (repo.primaryLanguage) {
      repo.language = repo.primaryLanguage.name;
    }

    repo.html_url = repo.url;
    repo.full_name = repo.nameWithOwner;
    repo.stargazers_count = repo.stargazers.totalCount;
    repo.forks_count = repo.forks.totalCount;

    repos.push(repo);
  }

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

  return { repos, contribs };
};

module.exports = async () => crawl('mvegter');
