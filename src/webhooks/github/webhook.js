const githubWebhook = require('./webhookHandler');

const handler = githubWebhook();
app.use(handler); // eslint-disable-line no-undef

const {
  enums: { webhookEvent, WebhookActions, commitStatus },
} = require('../../application/helper/constants');

const config = require('../../config.js');
const { createSequelize } = require('../../infra/sequelize/index.js');
const { createDAL } = require('../../application/dal/index');
const { createHttpRequests } = require('../../application/base/index.js');
const { createServices } = require('../../application/services/index.js');
const { createHelper } = require('../../application/helper/index.js');

let sequelize;
let httpRequests;
let helper;
let services;
let dal;

(async () => {
  /* eslint-disable prefer-destructuring */
  sequelize = await createSequelize();
  httpRequests = createHttpRequests();
  helper = createHelper();
  services = createServices({ httpRequests, helper, config });
  dal = createDAL({
    sequelize,
    services,
    helper,
    config,
  });
  /* eslint-enable prefer-destructuring */

  const {
    repositoryDAL: {
      getRepository,
      insertRepository,
      updateRepository,
      deleteRepository,
    },
    commitDAL: { autoMarkAsFixed, insertCommit, updateCommentCount },
    teamMemberDAL: { getTeamMemberById, insertTeamMember, updateTeamMember },
    collaboratorDAL: { addCollaborator, removeCollaborator },
  } = dal;

  const {
    githubServices: { getUserInfo },
  } = services;

  handler.on(
    webhookEvent.Repository,
    async (
      name,
      {
        action,
        repository: { id, full_name: fullName },
        organization: { id: organizationId },
      },
    ) => {
      if (
        action === WebhookActions.Created ||
        action === WebhookActions.updated ||
        action === WebhookActions.Publicized ||
        action === WebhookActions.Privatized
      ) {
        const item = {
          id,
          name,
          fullName,
          organizationId,
        };
        await insertRepository(item);
      } else if (action === WebhookActions.Archived)
        updateRepository({ isArchived: true }, id);
      else if (action === WebhookActions.Unarchived)
        updateRepository({ isArchived: false }, id);
      else if (action === WebhookActions.Deleted)
        await deleteRepository({ id });
    },
  );

  const createRepository = async (id, name, fullName, organizationId) => {
    const repository = await getRepository(id);
    if (repository == null) {
      const item = {
        id,
        name,
        fullName,
        organizationId,
      };
      return insertRepository(item);
    }
    return repository;
  };

  const createTeamMember = async login => {
    let teamMember = await getTeamMemberById({ login });
    if (teamMember == null) {
      teamMember = await getUserInfo(config.webhookSecretKey, login);
      if (teamMember) {
        const item = {
          id: teamMember.id,
          login: teamMember.login,
          name: teamMember.name,
          email: teamMember.email,
          avatarUrl: teamMember.avatar_url,
        };
        return insertTeamMember(item);
      }
    }
    return teamMember;
  };

  const createCommit = async (commit, parentSha, repositoryId, sender) => {
    await createTeamMember(sender.login);

    const item = {
      sha: commit.id,
      shortSha: commit.id.substring(0, 7),
      teamMemberId: sender.id,
      message: commit.message,
      commitDate: commit.timestamp,
      htmlUrl: commit.url,
      repositoryId,
      status: commitStatus.Pending.toString(),
      parentSha:
        parentSha.length > 0
          ? parentSha.substring(0, parentSha.length - 1)
          : parentSha,
    };
    return insertCommit(item);
  };

  handler.on(
    webhookEvent.Push,
    async (
      repositoryName,
      {
        commits,
        sender,
        repository: { id: repositoryId, full_name: repositoryFullName },
        organization: { id: organizationId },
      },
    ) => {
      await createRepository(
        repositoryId,
        repositoryName,
        repositoryFullName,
        organizationId,
      );

      for (let i = 0; i < commits.length; i += 1) {
        let parentSha = '';
        const { message } = commits[i];
        if (message.toLowerCase().indexOf('fixed sha') >= 0) {
          const arrayMessage = message.toLowerCase().split('sha');
          const shortShas = arrayMessage[1].replace(/\s/g, '');
          const arrayShortSha = shortShas.split(',');
          arrayShortSha.forEach(async shortSha => {
            if (shortSha.length === 7) {
              parentSha += `${shortSha},`;
              await autoMarkAsFixed(shortSha, repositoryId);
            }
          });
        }

        createCommit(commits[i], parentSha, repositoryId, sender);
      }
    },
  );

  handler.on(
    webhookEvent.Organization,
    async (webhookName, { action, invitation, membership }) => {
      const { id, login } = invitation == null ? membership.user : invitation;
      if (
        action === WebhookActions.MemberAdded ||
        action === WebhookActions.MemberInvited
      ) {
        const member = await getUserInfo(config.webhookSecretKey, login);
        if (member) {
          const item = {
            id: member.id,
            login: member.login,
            name: member.name,
            email: member.email,
            avatar_url: member.avatar_url,
          };
          return insertTeamMember(item);
        }
      }
      if (action === WebhookActions.MemberRemoved) {
        return updateTeamMember({ is_active: false }, id);
      }
      return true;
    },
  );

  handler.on(
    webhookEvent.CommitComment,
    async (
      webhookName,
      {
        action,
        repository: { full_name: repositoryFullName },
        comment: { commit_id: sha },
      },
    ) => {
      if (action === WebhookActions.Created) {
        return updateCommentCount(repositoryFullName, sha);
      }
      return true;
    },
  );

  handler.on(
    webhookEvent.Member,
    async (
      webhookName,
      {
        action,
        repository: { id: repositoryId },
        member: { id: teamMemberId, login, site_admin: isAdmin },
        sender: { id: senderId },
      },
    ) => {
      if (action === WebhookActions.Added) {
        await createTeamMember(login);
        return addCollaborator(teamMemberId, isAdmin, senderId, repositoryId);
      }
      if (action === WebhookActions.Removed) {
        const item = {
          teamMemberId,
          repositoryId,
        };
        return removeCollaborator(item);
      }
      return true;
    },
  );
})();
