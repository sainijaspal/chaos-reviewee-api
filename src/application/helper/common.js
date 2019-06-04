const dateFormat = require('dateformat');
const urlCrypt = require('url-crypt')(
  '~{ry*I)==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF',
);
const crypto = require('crypto');

const {
  enums: { commitStatus, repositoryRoles, projectType },
} = require('../helper/constants');

const createCommonHelper = () => {
  const algorithm = 'aes-256-ctr';
  const password = '@coolreviewpassword!';

  const encrypt = text => {
    const cipher = crypto.createCipher(algorithm, password);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  };

  const decrypt = text => {
    const decipher = crypto.createDecipher(algorithm, password);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  };

  const urlEncrypt = text => {
    // Encrypt your data
    const base64 = urlCrypt.cryptObj(text);
    return base64;
  };

  const urlDecrypt = text => {
    try {
      return urlCrypt.decryptObj(text);
    } catch (err) {
      err.message = `Failed to decrypt param '${text}'`;
      err.status = 404;
      throw err;
    }
  };

  const repositoryRolesList = () => {
    const roles = [];
    Object.keys(repositoryRoles).forEach(key => {
      roles.push({
        key,
        value: repositoryRoles[key],
      });
    });
    return roles;
  };

  const getCommitsReviewStatusQuery = () => {
    const now = new Date();
    return `SELECT r.id, r.name, r.channelName, 
    (SELECT COUNT(ch.commitUuid) filter (WHERE ch.status in (${
      commitStatus.Accepted
    }, 
    ${commitStatus.MarkAsFixed}) AND updatedAt >= '${dateFormat(
      now,
      'mm/dd/yyyy',
    )}') reviewedCount 
    FROM commitHistory ch 
    WHERE r.id = ch.repositoryId), 

    (SELECT COUNT(c.uuid) filter (WHERE c.status = ${
      commitStatus.Rejected
    }) rejectedCount 
    FROM commit c 
    WHERE r.id = c.repositoryId), 

    (SELECT COUNT(c.uuid) filter (WHERE c.status = ${
      commitStatus.Pending
    }) pendingCount 
    FROM commit c
    WHERE r.id = c.repositoryId), 

    (SELECT COUNT(c.uuid) todayCommitsCount 
    FROM commit c
    WHERE r.id = c.repositoryId AND c.commitDate::date = now()::date) 

    FROM repositories r 
    WHERE r.isNotificationsEnabled = true and r.isArchived = false`;
  };

  const getTeamMemberRepositories = (organizationId, teamMemberId, type) => {
    if (type === projectType.YourProjects) {
      return `(SELECT DISTINCT R."name", R."isForcefullDeploymentEnabled", R."fullName", R."technologyId", 
      TMR."repositoryId",
        
      (SELECT COUNT(uuid) filter (WHERE status = ${
        commitStatus.Pending
      }) reviewcount 
      FROM "Commit" C 
      WHERE TMR."repositoryId" = C."repositoryId"),
      (SELECT COUNT(uuid) filter (WHERE status = ${
        commitStatus.Rejected
      }) rejectedcount 
      FROM "Commit" C 
      WHERE TMR."repositoryId" = C."repositoryId"),
      COALESCE(TMRS."isArchived", false) as isArchived, 
      false as isReviewerRepositorySection, T.name as technologyName, T.icon
      FROM "Repository" R
      
      JOIN "TeamMemberRepository" TMR ON TMR."repositoryId" = R.id 
      LEFT JOIN "Technology" T on T.id = R."technologyId" 
      LEFT JOIN "TeamMemberRepositoryState" TMRS ON TMRS."repositoryId" = R.id 
      AND TMRS."teamMemberId" = ${teamMemberId}  
      AND TMRS."isReviewerRepositorySection" = false 
      WHERE R."isArchived" = false AND R."isActive" = true AND 
      TMR."teamMemberId" = ${teamMemberId}  and TMR."isReviewer" = false 
      AND R."organizationId" = ${organizationId})
      ORDER BY "reviewcount" DESC`;
    }

    return `(SELECT DISTINCT TMR."repositoryId", R."name", R."isForcefullDeploymentEnabled", R."fullName", 
    R."technologyId", 
    (SELECT COUNT(uuid) filter (WHERE status = ${
      commitStatus.Pending
    }) reviewcount 
    FROM "Commit" C 
    WHERE TMR."repositoryId" = C."repositoryId"), 
    (SELECT COUNT(uuid) filter (WHERE status = ${
      commitStatus.Rejected
    }) rejectedcount 
    FROM "Commit" C 
    WHERE TMR."repositoryId" = C."repositoryId"), 
    COALESCE(TMRS."isArchived", false) as isArchived, 
    true as "isReviewerRepositorySection", T."name" as technologyName, T."icon" 
    FROM "Repository" R 
    LEFT JOIN "Technology" T ON T."id" = R."technologyId" 
    JOIN "TeamMemberRepository" TMR ON TMR."repositoryId" = R."id" 
    LEFT JOIN "TeamMemberRepositoryState" TMRS ON TMRS."repositoryId" = R."id" 
    AND TMRS."teamMemberId" = ${teamMemberId}
    AND TMRS."isReviewerRepositorySection" = true 
    WHERE R."isArchived" = false AND R."isActive" = true 
    AND TMR."teamMemberId" = ${teamMemberId} 
    AND R."organizationId" = ${organizationId})
    ORDER BY "reviewcount" DESC`;
  };

  const updateReviewStatusQuery = timeInterval => `UPDATE public.commit 
  SET "status" = ${commitStatus.Rejected}, "updatedAt" = now() 
  WHERE "status" = ${
    commitStatus.Pending
  } AND commitDate < now() - interval '${timeInterval}' hour`;

  const getPendingReviewCommitsQuery = timeInterval => `SELECT c.uuid as commitId, 
  c.message as commitMessage, c.sha, c.shortSha, tm.name, tm.email, r.name as repositoryName, 
  r.fullName as repositoryFullName, r.id as repositoryId, r.channelName, r.isNotificationsEnabled, 
  r.is_archived F
  ROM public.commit c
  INNER JOIN public.teamMember tm ON c.teamMemberId = tm.id 
  INNER JOIN public.repository r ON c.repositoryId = r.id 
  WHERE "status" = ${commitStatus.Pending} 
  AND commitDate < now() - interval '${timeInterval}' hour AND r.isArchived = false 
  ORDER BY r.name`;

  const qryGetTeamMembersAssociatedToRepo = () => `SELECT t.id as teamMemberId, t.login, t.name, 
  t.email, tmr.id as teamMemberRepositoryId, tmr.repositoryId, r.name as repositoryName, 
  r.fullName as repositoryFullName, r.channelName, tmr.permission 
  FROM public.teamMember t 
  LEFT OUTER JOIN public.teamMemberRepository tmr ON t.id = tmr.teamMemberId 
  AND tmr.permission in (${repositoryRoles.Developer}, ${
    repositoryRoles.Reviewer
  }) 
  INNER JOIN public.repository r ON r.id = tmr.repositoryId 
  WHERE r.isArchived = false AND r.isEmailNotificationEnabled = true 
  AND t.isDailyEmailEnabled = true`;

  const qryGetUnReviewedCommitsBeforeSpecifiedSHA = shortSha => `SELECT count(*) FROM commit
  WHERE status in (${commitStatus.Pending}, ${commitStatus.Rejected}) 
  AND commitDate <= (SELECT commitDate FROM commit 
  WHERE shortSha = '${shortSha}') 
  AND repositoryId = (SELECT repositoryId FROM commit 
  WHERE shortSha = '${shortSha}')`;

  const sortArray = property => {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1); // eslint-disable-line no-param-reassign
    }
    return (a, b) => {
      let result = 0;
      if (a[property] < b[property]) {
        result = -1;
      } else if (a[property] > b[property]) {
        result = 1;
      }
      return result * sortOrder;
    };
  };

  /**
   * Common method for all api response
   * @method apiResponse
   */
  const apiResponse = (res, result, status, msg) => {
    res.json({
      status,
      data: result,
      message: msg,
    });
  };

  const exceptionHandler = fn => async (req, res, next) => {
    try {
      const { status, data } = await fn(req, res);
      res.status(status).send({
        success: true,
        status,
        ...data,
      });
    } catch (error) {
      next(error);
    }
  };

  const getResponse = fn => async (req, res, next) => {
    try {
      const { status, data } = await fn(req, res);
      res.status(status).send(data);
    } catch (error) {
      next(error);
    }
  };

  return {
    encrypt,
    urlEncrypt,
    urlDecrypt,
    decrypt,
    getTeamMemberRepositories,
    getCommitsReviewStatusQuery,
    updateReviewStatusQuery,
    getPendingReviewCommitsQuery,
    repositoryRolesList,
    qryGetTeamMembersAssociatedToRepo,
    qryGetUnReviewedCommitsBeforeSpecifiedSHA,
    sortArray,
    apiResponse,
    exceptionHandler,
    getResponse,
  };
};

module.exports = { createCommonHelper };
