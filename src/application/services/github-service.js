const timeAgo = require('node-time-ago');
const marked = require('marked');

const {
  enums: { repositoryRoles },
} = require('../helper/constants');

const createGithubServices = ({
  httpRequests: {
    getResponse,
    postRequest,
    deleteRequest,
    putRequest,
    patchRequest,
  },
  helper: {
    commonHelper: { urlDecrypt },
  },
  config: { githubAPIURL },
}) => {
  let globGhorg;

  const checkUserRole = user =>
    new Promise(resolve => {
      globGhorg.members({ role: 'admin' }, (err, data) => {
        if (err) {
          return resolve({
            success: false,
            message: err.message,
          });
        }
        if (!data || data.length <= 0) {
          return resolve({
            success: true,
            is_admin: false,
          });
        }
        const isAdmin = data.find(x => x.login === user.login) != null;
        return resolve({
          success: true,
          isAdmin,
        });
      });
    });

  const getUserInfo = async (token, userName) => {
    const url = `${githubAPIURL}users/${userName}`;
    return getResponse(url, token);
  };

  const getCommitComments = async (repo, token, sha) => {
    const url = `${githubAPIURL}repos/${repo}/commits/${sha}/comments`;
    const comments = await getResponse(url, token);

    for (let i = 0; i < comments.length; i += 1) {
      const preText = i === 0 ? 'commented ' : 'replied  ';
      comments[i].headerMessage =
        preText + timeAgo(new Date(comments[i].created_at));
      comments[i].comment = comments[i].body;
      comments[i].body = marked(comments[i].body);
    }
    return comments;
  };

  const postCommitComment = async (repo, token, sha, body) => {
    const url = `${githubAPIURL}repos/${repo}/commits/${sha}/comments`;
    return postRequest(url, token, body);
  };

  const updateCommitComment = async (repo, token, commentId, body) => {
    const url = `${githubAPIURL}repos/${repo}/comments/${commentId}`;
    return postRequest(url, token, body);
  };

  const deleteCommitComment = async (repositoryName, token, commentId) => {
    const url = `${githubAPIURL}repos/${repositoryName}/comments/${commentId}`;
    return deleteRequest(url, token);
  };

  const addRepositoryCollaborator = async (
    repositoryName,
    token,
    userName,
    role,
    org,
  ) => {
    const url = `${githubAPIURL}repos/${org}/${repositoryName}/collaborators/${userName}`;
    const permission = role === repositoryRoles.Reviewer ? 'pull' : 'push';
    return putRequest(url, token, { permission });
  };

  const deleteRepositoryCollaborator = async (
    repositoryName,
    token,
    userName,
    organization,
  ) => {
    const url = `${githubAPIURL}repos/${organization}/${repositoryName}/collaborators/${userName}`;
    return deleteRequest(url, token);
  };

  const getRepositoryInvitations = async token => {
    const url = `${githubAPIURL}user/repository_invitations`;
    return getResponse(url, token);
  };

  const acceptInvitation = async (invitationId, token) => {
    const url = `${githubAPIURL}user/repository_invitations/${invitationId}`;
    const result = await patchRequest(url, token);
    const status = result.response.statusCode;
    if (result.error) {
      return {
        status,
        success: false,
        message: result.error.message,
      };
    }
    if (result.response.statusCode === 204) {
      return {
        status,
        success: true,
        message: 'Invitation accepted',
      };
    }
    return {
      status,
      success: false,
      message: result.body.message,
    };
  };

  const declineInvitation = async (invitationId, token) => {
    const url = `${githubAPIURL}user/repository_invitations/${invitationId}`;
    const result = await deleteRequest(url, token);
    const status = result.response.statusCode;
    if (result.error) {
      return {
        status,
        success: false,
        message: result.error.message,
      };
    }
    if (result.response.statusCode === 204) {
      return {
        status,
        success: true,
        message: 'Invitation accepted',
      };
    }
    return {
      status,
      success: false,
      message: result.body.message,
    };
  };

  const getRepositoryReadMe = async (repositoryName, organization, token) => {
    repositoryName = urlDecrypt(repositoryName); // eslint-disable-line no-param-reassign
    const url = `${githubAPIURL}repos/${organization}/${repositoryName}/readme`;
    const invitations = await getResponse(url, token);

    if (invitations.message === 'Not Found') {
      return {
        repo_name: repositoryName,
        html_content: 'File not found',
      };
    }
    const decodedContent = new Buffer(invitations.content, 'base64'); // eslint-disable-line no-buffer-constructor
    const htmlContent = marked(decodedContent.toString());
    return {
      repo_name: repositoryName,
      html_content: htmlContent,
    };
  };

  const updateMember = async (name, token) => {
    const url = `${githubAPIURL}user`;
    const result = await patchRequest(url, token, { name });
    return {
      error: result.error,
      status_code: result.response.statusCode,
    };
  };

  const postTeamDetail = async (
    name,
    description,
    permission,
    privacy,
    userLogin,
    token,
    organization,
  ) => {
    const body = {
      name,
      description,
      permission,
      maintainers: [userLogin],
      privacy,
    };
    const url = `${githubAPIURL}orgs/${organization.login}/teams`;
    const result = await postRequest(url, token, body);
    if (result.error) {
      return {
        success: false,
        message: result.error.message,
      };
    }
    if (result.body && result.body.message === 'Validation Failed') {
      let message = '';
      result.body.errors.forEach(error => {
        message += error.message;
      });
      return {
        success: false,
        message,
      };
    }
    return {
      success: true,
      message: 'Team created!!',
      body: result.body,
    };
  };

  return {
    checkUserRole,
    getUserInfo,
    getCommitComments,
    postCommitComment,
    updateCommitComment,
    deleteCommitComment,
    addRepositoryCollaborator,
    deleteRepositoryCollaborator,
    getRepositoryInvitations,
    acceptInvitation,
    declineInvitation,
    getRepositoryReadMe,
    updateMember,
    postTeamDetail,
  };
};

module.exports = { createGithubServices };
