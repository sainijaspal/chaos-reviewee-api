const {
    enums: {
        environment,
    }
} = require('../helper/constants');
const { createHelper } = require('../src/application/helper/index.js');
const { createHttpRequest } = require('../src/application/base/index.js');
const { createSequelize } = require('../src/infra/sequelize/index.js');
const { createServices } = require('../src/application/services/index.js');
const { createDAL } = require('../src/application/dal/index.js');
const { reportError } = require('../src/infra/report-error.js');

(async () => {
    /* eslint-disable no-console */
    let sequelize, services, httpRequest, helper;
    const getRejectedCommitsByDeveloper = (commit_list) => {
        const rejected_commits = [];
        commit_list.forEach((commit) => {
            const commit_obj = {};
            commit_obj.message = commit.message;
            commit_obj.commit_link = `${process.env.BASE_URL}/commit?id=${urlEncrypt(commit.repository_id.toString())}&name=${commit.dataValues.repository.dataValues.name}&sha=${commit.short_sha}`;
            rejected_commits.push(commit_obj);
        });
        return rejected_commits;
    }

    const getRejectedCommitsCount = (commits_list) => {
        const repositories_list = [...new Set(commits_list.map(commit => commit.repository_id))];
        const rejected_commits = [];
        repositories_list.forEach((repository) => {
            const repo_obj = {};
            const repo_commits_count = commits_list.filter(commits => commits.repository_id === repository).length;
            const commit = commits_list.find(commits => commits.repository_id === repository);
            repo_obj.unreviewed_project_count = repo_commits_count;
            repo_obj.project_name = commit.dataValues.repository.dataValues.name;
            rejected_commits.push(repo_obj);
        });
        return rejected_commits;
    }

    try {
        if (process.env.NODE_ENV === environment.Production) {
            httpRequest = createHttpRequest();
            helper = createHelper();
            sequelize = await createSequelize();
            services = createServices({ httpRequest, helper });

            const {
                commit: { getCommitsRepos },
                teamMember: { getTeamMembersAssociatedRepo }
            } = createDAL({ sequelize, services, helper });
            const {
                mailServices: {
                    systemRejectedCommitsEmail,
                }
            } = services;

            const [members] = await getTeamMembersAssociatedRepo();
            if (members.length > 0) {
                const team_member_emails = [...new Set(members.reduce((users, user) => (user.email != null && user.email !== '' ? [...users, user.email] : users), []))];

                team_member_emails.forEach(async (team_member_email) => {
                    const team_member_repos_as_developer = [...new Set(members.reduce((team_member_repos_as_developers, users) => (users.email == team_member_email && users.permission == 2 ? [...team_member_repos_as_developers, users.repository_id] : team_member_repos_as_developers), []))];
                    const team_member_repos_as_reviewer = [...new Set(members.reduce((team_member_repos_as_developers, users) => (users.email == team_member_email && users.permission == 3 ? [...team_member_repos_as_developers, users.repository_id] : team_member_repos_as_developers), []))];
                    const commits_developer_result = await getCommitsRepos(team_member_repos_as_developer);
                    const commits_reviewer_result = await getCommitsRepos(team_member_repos_as_reviewer);
                    const rejected_commits = getRejectedCommitsByDeveloper(commits_developer_result);
                    const my_projects = getRejectedCommitsCount(commits_developer_result);
                    const reviewer_projects = getRejectedCommitsCount(commits_reviewer_result);
                    if (commits_developer_result.length > 0 || commits_reviewer_result.length > 0) {
                        const user_info = members.find(users => users.email == team_member_email);
                        systemRejectedCommitsEmail(team_member_email, user_info.login);
                    }
                });
            }
        }
    } catch (error) {
        reportError(error);
    } finally {
        await sequelize.close();
    }
})();
