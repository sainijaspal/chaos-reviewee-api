const Sequelize = require('sequelize');

const {
  enums: { commitStatus, repositoryRoles },
} = require('../helper/constants');

const createRepositoryDAL = ({
  sequelize: {
    models: {
      Repository,
      TeamMemberRepository,
      TeamMemberRepositoryState,
      TeamMember,
      Technology,
      Commit,
    },
    db,
  },
  helper: {
    commonHelper: { urlDecrypt, getTeamMemberRepositories },
  },
}) => {
  const insertRepository = item =>
    Repository.findOrCreate({
      where: {
        id: item.id,
      },
      attributes: ['id', 'name', 'fullName', 'organizationId'],
      defaults: item,
    });

  const predicate = () => {
    const fields = [];
    const nFields = arguments.length; // eslint-disable-line no-undef
    let field;
    let name;
    let cmp;

    const defaultCmp = (a, b) => {
      if (a === b) return 0;
      return a < b ? -1 : 1;
    };
    const getCmpFunc = (primer, reverse) => {
      const dfc = defaultCmp;
      // closer in scope
      cmp = defaultCmp;
      if (primer) {
        cmp = (a, b) => dfc(primer(a), primer(b));
      }
      if (reverse) {
        return (a, b) => -1 * cmp(a, b);
      }
      return cmp;
    };

    // preprocess sorting options
    for (let i = 0; i < nFields; i += 1) {
      field = arguments[i]; // eslint-disable-line no-undef
      if (typeof field === 'string') {
        name = field;
        cmp = defaultCmp;
      } else {
        name = field.name; // eslint-disable-line prefer-destructuring
        cmp = getCmpFunc(field.primer, field.reverse);
      }
      fields.push({
        name,
        cmp,
      });
    }

    // final comparison function
    return (A, B) => {
      let result;
      for (let i = 0; i < nFields; i += 1) {
        result = 0;
        field = fields[i];
        name = field.name; // eslint-disable-line prefer-destructuring

        result = field.cmp(A[name], B[name]);
        if (result !== 0) break;
      }
      return result;
    };
  };

  const sortProjects = (projectList, columnName) =>
    projectList.sort(
      predicate({
        name: columnName,
        primer: parseInt,
        reverse: true,
      }),
    );

  const getRepositories = async (
    organizationId,
    teamMemberId,
    projectType,
    archive,
  ) => {
    const query = getTeamMemberRepositories(
      organizationId,
      teamMemberId,
      projectType,
    );
    const result = await db.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const repos = await result.filter(x => x.isarchived === archive);
    return sortProjects(repos, 'reviewcount');
  };

  const getAllRepositories = async organizationId => {
    return Repository.findAll({
      where: {
        organizationId,
      },
      order: [['name', 'ASC']],
      attributes: [
        'id',
        'name',
        'fullName',
        'channelName',
        'isNotificationsEnabled',
        'isForcefullDeploymentEnabled',
        'technologyId',
        'isArchived',
        'isActive',
        'isEmailNotificationEnabled',
        'organizationId',
        'uatToken',
        'productionToken',
        'isRollbarNotificationEnabled',
      ],
      include: [
        {
          model: Technology,
          as: 'technology',
          attributes: ['id', 'name', 'icon'],
        },
      ],
    });
  };

  const getRepository = id =>
    Repository.findOne({
      where: {
        id,
      },
      attributes: ['id', 'name', 'fullName', 'channelName', 'technologyId'],
    });

  const updateRepository = (body, id) =>
    Repository.update(body, {
      where: {
        id,
      },
    });

  const deleteRepository = item =>
    Repository.destroy({
      where: item,
    });

  const getRepositoryTeamMembers = async repositoryId => {
    repositoryId = urlDecrypt(repositoryId); // eslint-disable-line no-param-reassign
    const members = await TeamMemberRepository.findAll({
      where: {
        repositoryId,
      },
      attributes: ['teamMemberId', 'isReviewer', 'permission'],
      include: [
        {
          model: TeamMember,
          attributes: ['id', 'login', 'avatarUrl', 'email'],
          required: true,
        },
      ],
    });
    return {
      members: members.filter(x => x.permission === repositoryRoles.Developer),
      reviewers: members.filter(x => x.permission === repositoryRoles.Reviewer),
    };
  };

  const archiveProject = async (
    repositoryId,
    isArchived,
    projectType,
    teamMemberId,
  ) => {
    const isReviewerRepositorySection = projectType !== '0';
    const repositoryStates = await TeamMemberRepositoryState.findOne({
      where: {
        repositoryId,
        teamMemberId,
        isReviewerRepositorySection,
      },
    });
    if (!repositoryStates) {
      // Item not found, create a new one
      const data = {
        repositoryId,
        teamMemberId,
        isArchived,
        isReviewerRepositorySection,
        isCurrent: false,
      };
      return TeamMemberRepositoryState.create(data);
    }
    return TeamMemberRepositoryState.update(
      { isArchived },
      {
        where: {
          repositoryId,
          teamMemberId,
          isReviewerRepositorySection,
        },
      },
    );
  };

  const getAllEnabledRollbarNotificationRepositories = () =>
    Repository.findAll({
      where: {
        isRollbarNotificationEnabled: true,
        isActive: true,
      },
      attributes: [
        'name',
        'channelName',
        'uatToken',
        'productionToken',
        'isRollbarNotificationEnabled',
      ],
      order: '"name" ASC',
    });

  const checkProjectReadyToDeploy = async name => {
    const item = await Repository.find({
      where: { name },
      attributes: [
        'channelName',
        'isForcefullDeploymentEnabled',
        'isNotificationsEnabled',
      ],
      include: [
        {
          model: Commit,
          where: { status: commitStatus.Rejected },
          required: false,
          attributes: ['uuid'],
        },
      ],
    });
    if (item) {
      if (item.isForcefullDeploymentEnabled) {
        return {
          success: true,
          rejectedCount: 0,
          channelName: item.channelName,
          is_slack_notifications_on: item.isNotificationsEnabled,
        };
      }
      return {
        success: !(item.commits.length > 0),
        rejectedCount: item.commits.length,
        channelName: item.channelName,
        isSlackNotifications_on: item.isNotificationsEnabled,
      };
    }
    return {
      success: false,
      error: 'App name does not exists!',
    };
  };

  const yetToReviewRepoCommits = async name => {
    const item = await Repository.findOne({
      where: { name },
      attributes: [
        'id',
        'name',
        'fullName',
        'channelName',
        'isForcefullDeploymentEnabled',
        'isNotificationsEnabled',
      ],
      include: [
        {
          model: Commit,
          where: {
            $or: [
              {
                status: commitStatus.Rejected,
              },
              {
                status: commitStatus.Pending,
              },
            ],
          },
          required: false,
          attributes: ['uuid', 'message', 'sha'],
        },
      ],
    });
    if (item) {
      if (
        item.commits.length === 1 &&
        item.commits[0].message.toLowerCase() === 'push to production'
      ) {
        return {
          success: true,
          repository: item,
        };
      }
      return {
        success: !(item.commits.length > 0),
        repository: item,
      };
    }
    return {
      success: false,
      error: 'App name does not exists!',
    };
  };

  return {
    insertRepository,
    getRepositories,
    getAllRepositories,
    getRepository,
    updateRepository,
    deleteRepository,
    getRepositoryTeamMembers,
    archiveProject,
    getAllEnabledRollbarNotificationRepositories,
    checkProjectReadyToDeploy,
    yetToReviewRepoCommits,
  };
};

module.exports = { createRepositoryDAL };
