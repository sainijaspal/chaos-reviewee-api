const { LINQ } = require('node-linq');
const timeAgo = require('node-time-ago');
const dateFormat = require('dateformat');
const github = require('octonode');
const marked = require('marked');
const { QueryTypes, Op } = require('sequelize');
const pluralize = require('pluralize');
const { NotFoundError } = require('../helper/errors');

const {
  enums: { filterStatus, commitStatus, notificationType },
} = require('../helper/constants');

const createCommitDAL = ({
  sequelize: {
    models: { Commit, TeamMember, Repository, CommitHistory },
    db,
  },
  services: {
    githubServices: {
      getCommitComments,
      postCommitComment,
      updateCommitComment,
      deleteCommitComment,
    },
  },
  helper: {
    commonHelper: {
      urlEncrypt,
      getCommitsReviewStatusQuery,
      getPendingReviewCommitsQuery,
      updateReviewStatusQuery,
      sortArray,
      qryGetUnReviewedCommitsBeforeSpecifiedSHA,
    },
  },
  config: { webhookSecretKey },
  notificationDAL: { insertNotifications },
  commitHistoryDAL: { insertCommitHistory },
}) => {
  const insertCommit = async item =>
    Commit.findOrCreate({
      where: {
        sha: item.sha,
      },
      defaults: item,
    });

  const autoMarkAsFixed = async (shortSha, repositoryId) => {
    const item = {
      status: commitStatus.MarkAsFixed.toString(),
    };
    return Commit.update(item, {
      where: {
        repositoryId,
        shortSha,
      },
    });
  };

  const getRejectedText = commitsHistory => {
    let retValue = '';
    if (commitsHistory && commitsHistory.length > 0) {
      try {
        const rejectedCommmits = commitsHistory.filter(
          obj => obj.status === commitStatus.Rejected,
        );
        if (rejectedCommmits != null && rejectedCommmits.length > 0) {
          if (rejectedCommmits[0].reviewer != null) {
            retValue = `(Rejected by ${rejectedCommmits[0].reviewer.login})`;
          } else {
            retValue = '(Rejected by system)';
          }
        }
      } catch (error) {
        throw error;
      }
    }
    return retValue;
  };

  // /we want to display the information who accepted or rejected the code
  const getAcceptedByUser = commitsHistory => {
    let retValue = '';
    if (commitsHistory && commitsHistory.length > 1) {
      const items = commitsHistory.sort(sortArray('id'));
      if (
        items[0].status === commitStatus.Accepted &&
        items[1].status === commitStatus.Rejected
      ) {
        retValue = items[0].reviewer.login;
      }
    }
    return retValue;
  };

  const getGroupedList = (teamMemberId, commitList, isReviewer) => {
    const items = new LINQ(commitList)
      .Select(item => ({
        commitUuid: item.uuid,
        teamMemberId: item.teamMemberId,
        repositoryId: item.repositoryId,
        authorName: item.teamMember.login,
        authorId: item.teamMember.id,
        authorFullName: item.teamMember.name,
        repositoryName: item.repository.name,
        repositoryFullName: item.repository.fullName,
        commitDate: dateFormat(new Date(item.commitDate), 'mediumDate'),
        commitTime: timeAgo(new Date(item.commitDate)),
        message: item.message.substring(0, 90),
        description:
          item.message.length > 90
            ? item.message.substring(90, item.message.length)
            : null,
        reviewerId: item.teamMemberId,
        status: item.status,
        avatarUrl: item.teamMember.avatarUrl || '/images/noimage.png',
        email: item.teamMember.email,
        sha: item.sha.trim(),
        shortSha: item.shortSha.trim(),
        fullMessage: item.message,
        notMine: item.dataValues.teamMemberId !== teamMemberId,
        htmlUrl: item.htmlUrl,
        isReviewer,
        isRejected: item.status === commitStatus.Rejected,
        isPending: item.status === commitStatus.Pending,
        isAccepted: item.status === commitStatus.Accepted,
        isMarkAsFixed: item.status === commitStatus.MarkAsFixed,
        updatedDate: dateFormat(new Date(item.updatedAt), 'mediumDate'),
        rejectedBy: item.reviewer ? item.reviewer.login : 'system',
        acceptedBy: item.reviewer ? item.reviewer.login : 'system',
        reviewerEmail: item.reviewer ? item.reviewer.email : '',
        haveParentSha: !(item.parentSha === '' || item.parentSha == null),
        parentSha:
          item.parentSha === '' || item.parentSha == null
            ? []
            : item.parentSha.split(','),
        commentsCount: item.commentsCount,
        rejectReviewer: getRejectedText(item.commitHistory),
        firstlyAcceptedBy: getAcceptedByUser(item.commitHistory),
      }))
      .GroupBy(item => item.commitDate);

    const arrayObjects = [];
    Object.keys(items).forEach(key => {
      const obj = {};
      obj.date = key;
      obj.commitUuid = dateFormat(key, 'dd-mm-yyyy');
      obj.commits = items[key];
      arrayObjects.push(obj);
    });
    return arrayObjects;
  };

  const commitStatusFilter = (qry, status) => {
    const filterCommitStatus = filterStatus;
    // eslint-disable-next-line radix
    switch (parseInt(status)) {
      case filterCommitStatus.all: // just skip
        break;
      case filterCommitStatus.rejectedOrToBeReviewed:
        // eslint-disable-next-line no-param-reassign
        qry.status = {
          [Op.in]: [commitStatus.Pending, commitStatus.Rejected],
        };
        break;
      case filterCommitStatus.toBeReviewed:
        qry.status = commitStatus.Pending; // eslint-disable-line no-param-reassign
        break;
      case filterCommitStatus.rejected:
        qry.status = commitStatus.Rejected; // eslint-disable-line no-param-reassign
        break;
      case filterCommitStatus.accepted:
        qry.status = commitStatus.Accepted; // eslint-disable-line no-param-reassign
        break;
      case filterCommitStatus.rejectedByDeveloper:
        qry.status = commitStatus.Rejected; // eslint-disable-line no-param-reassign
        // eslint-disable-next-line no-param-reassign
        qry.reviewerId = {
          [Op.ne]: null,
        };
        break;
      case filterCommitStatus.rejectedBySystem:
        qry.status = commitStatus.Rejected; // eslint-disable-line no-param-reassign
        qry.reviewerId = null; // eslint-disable-line no-param-reassign
        break;
      case filterCommitStatus.markAsFixed:
        qry.status = commitStatus.MarkAsFixed; // eslint-disable-line no-param-reassign
        break;
      default:
        // eslint-disable-next-line no-param-reassign
        qry.status = {
          [Op.in]: [commitStatus.Pending, commitStatus.Rejected],
        };
        break;
    }
  };

  const getCommits = async (
    repositoryId,
    teamMemberId,
    offset,
    status,
    MembersFilter,
  ) => {
    const pageSize = 20;
    const whereCondition = {
      repositoryId,
    };
    commitStatusFilter(whereCondition, status);

    if (MembersFilter) {
      whereCondition.teamMemberId = {
        [Op.in]: MembersFilter.split(','),
      };
    }

    let commitList = await Commit.findAndCountAll({
      where: whereCondition,
      attributes: [
        'uuid',
        'repositoryId',
        'teamMemberId',
        'commitDate',
        'message',
        'reviewerId',
        'status',
        'sha',
        'shortSha',
        'htmlUrl',
        'updatedAt',
        'parentSha',
        'commentsCount',
      ],
      limit: pageSize,
      offset,
      order: [['commitDate', 'ASC']],
      include: [
        {
          model: TeamMember,
          as: 'teamMember',
          attributes: ['id', 'login', 'avatarUrl', 'email', 'name'],
        },
        {
          model: TeamMember,
          as: 'reviewer',
          attributes: ['login', 'avatarUrl', 'email'],
        },
        {
          model: Repository,
          as: 'repository',
          attributes: ['name', 'fullName'],
        },
        {
          model: CommitHistory,
          as: 'commitHistories',
          where: {
            status: {
              [Op.in]: [commitStatus.Accepted, commitStatus.Rejected],
            },
          },
          required: false,
          attributes: ['id', 'reviewerId', 'status'],
          include: [
            {
              model: TeamMember,
              as: 'reviewer',
              attributes: ['login'],
            },
          ],
        },
      ],
    });

    commitList = await getGroupedList(teamMemberId, commitList.rows, true);
    const retOffset = commitList.length < pageSize ? '' : offset + pageSize;
    return {
      commitList,
      offset: retOffset,
    };
  };

  const getCommitDetail = async condition => {
    const item = Commit.findOne({
      where: condition,
      attributes: [
        'uuid',
        'commitDate',
        'message',
        'status',
        'shortSha',
        'sha',
        'htmlUrl',
        'updatedAt',
        'parentSha',
        'teamMemberId',
        'reviewerId',
        'repositoryId',
      ],
      include: [
        {
          model: TeamMember,
          as: 'teamMember',
          attributes: ['id', 'login', 'avatarUrl', 'email', 'name'],
        },
        {
          model: TeamMember,
          as: 'reviewer',
          attributes: ['id', 'login', 'avatarUrl', 'email'],
        },
        {
          model: Repository,
          as: 'repository',
          attributes: ['id', 'name', 'fullName'],
        },
        {
          model: CommitHistory,
          as: 'commitHistories',
          where: {
            status: {
              [Op.in]: [commitStatus.Accepted, commitStatus.Rejected],
            },
          },
          required: false,
          attributes: ['id', 'reviewerId', 'status'],
          include: [
            {
              model: TeamMember,
              as: 'reviewer',
              attributes: ['login'],
            },
          ],
        },
      ],
      // eslint-disable-next-line no-shadow
    }).then(item =>
      item.get({
        plain: true,
      }),
    );

    if (!item) {
      throw new NotFoundError();
    }

    return item;
  };

  const checkAuthorOfComment = (comments, loggedInUser) => {
    const inlineComments = [];
    comments.forEach(comment => {
      if (comment) {
        if (comment.user.id === loggedInUser) {
          // check that author is logged in user
          comment.isCommentAuthor = true; // eslint-disable-line no-param-reassign
        }
        inlineComments.push(comment);
      }
    });
    return inlineComments;
  };

  const getCommitFile = (file, comments, userId) => {
    const fileObj = {
      fileName: file.filename,
      lines: [],
      sha: file.sha,
      encodedFileName: urlEncrypt(file.filename),
    };
    const lines = file.patch.split('\n');
    let additionLineNo = 0;
    let deletionLineNo = 0;
    let position = 1;

    lines.forEach(line => {
      const objLine = {};
      objLine.content = line;
      objLine.path = file.filename;
      objLine.expanded = true;
      if (line.startsWith('@@')) {
        const lineText = line.match(new RegExp('@@(.*)@@'));
        const lineDet = lineText[0]
          .replace(/@@|-|\+/g, '')
          .trim()
          .split(' ');
        deletionLineNo = parseInt(lineDet[0].split(',')[0]); // eslint-disable-line radix
        additionLineNo = parseInt(lineDet[1].split(',')[0]); // eslint-disable-line radix
        objLine.expanded = false;
        objLine.cssClass = 'code-expandable';
      } else if (line.startsWith('+')) {
        objLine.cssClass = 'code-addition';
        objLine.additionLineno = additionLineNo;
        objLine.position = position;
        additionLineNo += 1;
        position += 1;
      } else if (line.startsWith('-')) {
        objLine.cssClass = 'code-deletion';
        objLine.deletionLineNo = deletionLineNo;
        objLine.position = position;
        deletionLineNo += 1;
        position += 1;
      } else {
        objLine.cssClass = 'code-context';
        objLine.additionLineno = additionLineNo;
        additionLineNo += 1;
        objLine.deletionLineNo = deletionLineNo;
        objLine.position = position;
        deletionLineNo += 1;
        position += 1;
      }
      if (comments.length > 0) {
        const inlineComments = comments.filter(
          x => x.position === objLine.position && x.path === file.filename,
        );
        objLine.comments = checkAuthorOfComment(inlineComments, userId);
      }
      fileObj.lines.push(objLine);
    });
    return fileObj;
  };

  const getGithubCommitDetail = async (
    repositoryFullName,
    sha,
    token,
    teamMemberId,
  ) => {
    const githubClient = github.client(token);
    const ghrepo = githubClient.repo(repositoryFullName);
    const commitDetail = {};
    return new Promise((resolve, reject) => {
      ghrepo.commit(sha.trim(), async (err, data) => {
        if (err) {
          reject(err);
        } else {
          commitDetail.message = data.commit.message.substring(0, 57);
          commitDetail.author = data.author;
          commitDetail.filesCount = data.files.length;
          commitDetail.stats = data.stats;
          commitDetail.date = timeAgo(new Date(data.commit.committer.date));
          commitDetail.sha = data.sha;

          const fileList = [];
          const comments = await getCommitComments(
            repositoryFullName,
            token,
            sha,
          );

          data.files.forEach(file => {
            if (file && file.patch) {
              const fileResult = getCommitFile(file, comments, teamMemberId);
              fileList.push(fileResult);
            }
          });
          commitDetail.comments = checkAuthorOfComment(
            comments.filter(x => x.position == null),
            teamMemberId,
          );
          commitDetail.commentsMessage = pluralize(
            `${comments.length} comment`,
            comments.length,
          );
          resolve({
            files: fileList,
            commitDetail,
            title: repositoryFullName,
          });
        }
      });
    });
  };

  const updateCommitStatus = async (item, uuid) => {
    return Commit.update(item, {
      where: {
        uuid,
        teamMemberId: {
          [Op.ne]: item.reviewerId,
        },
      },
      returning: true,
    });
  };

  const acceptCommit = async (uuid, reviewerId) => {
    let item = {
      status: commitStatus.Accepted,
      reviewerId,
    };
    const [, [commitDetail]] = await updateCommitStatus(item, uuid);

    if (!commitDetail) {
      throw new NotFoundError();
    }

    item = {
      uuid,
      reviewerId,
      status: commitStatus.Accepted,
    };
    insertCommitHistory(item);
    return commitDetail;
  };

  const rejectCommit = async (uuid, reviewerId) => {
    let item = {
      status: commitStatus.Rejected,
      reviewerId,
    };
    const [, [commit]] = await updateCommitStatus(item, uuid);
    if (!commit) {
      throw new NotFoundError();
    }

    /* if commit was already accepted then send email to the old reviewer */
    insertNotifications(
      notificationType.Rejected,
      commit.repositoryId,
      uuid,
      commit.teamMemberId, // author Id of commit
      null,
      reviewerId,
    );

    item = {
      commitUuid: uuid,
      reviewerId,
      status: commitStatus.Rejected,
    };
    await insertCommitHistory(item);
    return commit;
  };

  const markAsFixedCommit = async (uuid, reviewerId) => {
    let item = {
      status: commitStatus.MarkAsFixed.toString(),
      reviewerId,
    };
    const [, [commitDetail]] = await updateCommitStatus(item, uuid);
    if (!commitDetail) {
      throw new NotFoundError();
    }

    item = {
      commitUuid: uuid,
      repositoryId: commitDetail.repositoryId,
      reviewerId,
      status: commitStatus.MarkAsFixed.toString(),
    };
    insertCommitHistory(item);
    return commitDetail;
  };

  const saveComment = async (
    sha,
    comment,
    position,
    path,
    commenterId,
    token,
  ) => {
    const commit = await getCommitDetail({ sha });
    if (!commit) {
      throw new NotFoundError();
    }

    const commentBody = {
      body: comment,
      path,
      position,
    };
    const result = await postCommitComment(
      commit.repository.fullName,
      token,
      sha.trim(),
      commentBody,
    );

    const comments = await getCommitComments(
      commit.repository.fullName,
      token,
      sha.trim(),
    );

    result.commentsMessage = pluralize(
      `${comments.length} comment`,
      comments.length,
    );

    const preText = comments.length === 1 ? ' commented ' : ' replied ';
    result.headerMessage = preText + timeAgo(new Date(result.createdAt));
    result.comment = result.body;
    result.body = marked(result.body);

    const membersComments = [];
    membersComments.push(parseInt(commenterId)); // eslint-disable-line radix

    for (let i = 0; i < comments.length; i += 1) {
      // skip logged in user too bcz he does comment
      if (
        !membersComments.includes(comments[i].user.id) &&
        comments[i].user.id !== commenterId
      ) {
        membersComments.push(comments[i].user.id);
      }
    }
    result.membersComments = membersComments;
    result.commit = commit;
    insertNotifications(
      notificationType.Comment,
      commit.repositoryId,
      commit.uuid,
      commit.teamMemberId,
      membersComments,
      commenterId,
    );
    return result;
  };

  const updateComment = async (
    commentId,
    commentBody,
    repositoryName,
    token,
  ) => {
    const item = {
      body: commentBody,
      id: commentId,
    };
    await updateCommitComment(repositoryName, token, commentId, item);
    return marked(commentBody);
  };

  const updateCommentCount = async (repositoryName, sha) => {
    const comments = await getCommitComments(
      repositoryName,
      webhookSecretKey,
      sha,
    );
    const commentsCount = comments.length;
    await Commit.update(
      { commentsCount },
      {
        where: {
          sha,
        },
      },
    );
    return commentsCount;
  };

  const deleteComment = async (commentId, sha, repositoryName, token) => {
    await deleteCommitComment(repositoryName, token, commentId);
    return updateCommentCount(repositoryName, sha.trim());
  };

  const getCommitsRepos = repositoryIds =>
    Commit.findAll({
      where: {
        repositoryId: {
          $in: repositoryIds,
        },
        status: commitStatus.Rejected,
      },
      attributes: ['uuid', 'sha', 'shortSha', 'message', 'repositoryId'],
      include: [
        {
          model: Repository,
          where: {
            isArchived: false,
          },
          attributes: ['name'],
          required: true,
        },
      ],
    });

  const getRecentCommit = async repositoryId =>
    Commit.findOne({
      where: { repositoryId },
      attributes: ['uuid', 'message'],
      limit: 1,
      order: 'commitDate DESC',
    });

  const getUnReviewedCommitsBeforeSpecifiedSHA = async shortSha => {
    const query = qryGetUnReviewedCommitsBeforeSpecifiedSHA(shortSha);
    return db.query(query, {
      type: QueryTypes.SELECT,
    });
  };

  const getCommitsReviewStatus = () => {
    const query = getCommitsReviewStatusQuery();
    return db.query(query, {
      type: QueryTypes.SELECT,
    });
  };

  const rejectCommitsAndSendNotification = async timeInterval => {
    const qryGetPendingCommits = getPendingReviewCommitsQuery(timeInterval);

    const [commits] = await db.query(qryGetPendingCommits);

    if (commits.length > 0) {
      const qryUpdatePendingCommitsStatus = updateReviewStatusQuery(
        timeInterval,
      );

      await db.query(qryUpdatePendingCommitsStatus);

      return commits;
    }
    return null;
  };

  const deleteCommmits = async item =>
    Commit.destroy({
      where: item,
    });

  return {
    insertCommit,
    autoMarkAsFixed,
    getCommits,
    getGithubCommitDetail,
    getCommitDetail,
    acceptCommit,
    rejectCommit,
    markAsFixedCommit,
    saveComment,
    updateComment,
    deleteComment,
    getCommitsRepos,
    deleteCommmits,
    getRecentCommit,
    getUnReviewedCommitsBeforeSpecifiedSHA,
    getCommitsReviewStatus,
    rejectCommitsAndSendNotification,
    updateCommentCount,
  };
};

module.exports = { createCommitDAL };
