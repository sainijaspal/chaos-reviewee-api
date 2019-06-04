const postmark = require('postmark');
const hbs = require('hbs');
const dateFormat = require('dateformat');
const marked = require('marked');
const fs = require('fs');
const path = require('path');
const {
  enums: { commitStatus, emailTemplate },
} = require('../helper/constants');

const createMailNotifications = ({
  helper: {
    commonHelper: { urlEncrypt },
  },
  config: { baseURL, fromEmail, postmarkAPIKey, newRepositoryNotifyEmails },
}) => {
  const client = new postmark.Client(postmarkAPIKey);

  const validateEmail = email =>
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
      email,
    );

  const validateEmails = value => {
    if (value) {
      const result = value.split(',');
      for (let i = 0; i < result.length; i += 1) {
        if (!validateEmail(result[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const emailToAcceptedByUser = (
    toEmail,
    linkHref,
    repositoryNname,
    rejectedBy,
    commitTitle,
    comments,
  ) => {
    if (validateEmails(toEmail)) {
      return client.sendEmailWithTemplate({
        From: `${rejectedBy}<${fromEmail}>`,
        To: toEmail,
        TemplateId: emailTemplate.AcceptedByUser,
        TemplateModel: {
          commit_title: commitTitle,
          rejected_by: rejectedBy,
          comments,
          link_href: linkHref,
          repo_name: repositoryNname,
          name: toEmail,
        },
      });
    }
    return false;
  };

  const sendRejectedMail = async (
    reviewerLogin,
    authorEmail,
    authorLogin,
    commitMessage,
    repositoryName,
    repositoryId,
    shortSha,
    sha,
    currentCommitStatus,
    oldReviewerEmails,
    comments,
  ) => {
    if (validateEmails(authorEmail)) {
      const commitedBy = authorLogin;
      const linkHref = `${baseURL}/commit?id=${urlEncrypt(
        repositoryId,
      )}&sha=${shortSha}&lsha=${sha}&name=${repositoryName}`;

      return new Promise((resolve, reject) => {
        client.sendEmailWithTemplate(
          {
            From: `${reviewerLogin}<${fromEmail}>`,
            To: authorEmail,
            TemplateId: emailTemplate.RejectedCommit,
            TemplateModel: {
              commit_title: commitMessage,
              commited_by: commitedBy,
              rejected_by: reviewerLogin,
              link_href: linkHref,
              link_text: 'view it on reviewee',
              repo_name: repositoryName,
            },
          },
          err => {
            if (err) {
              reject(err);
            } else {
              // if firstly accepted by another user then send him notification
              if (
                currentCommitStatus &&
                currentCommitStatus === commitStatus.Accepted
              ) {
                emailToAcceptedByUser(
                  oldReviewerEmails.toString(),
                  linkHref,
                  repositoryName,
                  reviewerLogin,
                  commitMessage,
                  comments,
                );
              }
              resolve({
                success: true,
                message: 'Commit rejected and email sent to author.',
                rejected_message: `on ${dateFormat(
                  new Date(),
                  'mediumDate',
                )} by ${reviewerLogin}`,
              });
            }
          },
        );
      });
    }
    const mDate = dateFormat(new Date(), 'mediumDate');
    return {
      success: false,
      message: `Commit rejected but ${authorLogin} email address is not found.`,
      rejected_message: `on ${mDate} by ${reviewerLogin}`,
    };
  };

  const systemRejectedCommitsEmail = (email, name, data) => {
    if (validateEmails(email)) {
      return client.sendEmailWithTemplate({
        From: fromEmail,
        To: email,
        TemplateId: emailTemplate.SystemRejectedCommits,
        TemplateModel: {
          my_projects: data.my_projects,
          reviewer_projects: data.reviewer_projects,
          rejected_commits: data.rejected_commits,
          name,
        },
      });
    }
    return false;
  };

  const sendCommitCommentEmail = (
    login,
    comment,
    commitMessage,
    sha,
    repositoryId,
    repoName,
    commentAuthorEmails,
  ) => {
    if (validateEmails(commentAuthorEmails.toString())) {
      const htmlBody = marked(
        comment.replace(/{/g, '&#123;').replace(/}/g, '&#125;'),
      ); // escape curly braces
      const subject = `New comment on: Re [${repoName}] ${commitMessage}(${sha})`;
      const actionURL = `${baseURL}/commit?id=${repositoryId}&sha=${sha}&name=${repoName}`;
      const commentTemplate = path.join(
        __dirname,
        '../../../src/application/templates/commitComment.hbs',
      );
      const source = fs.readFileSync(commentTemplate, 'utf8');
      const template = hbs.compile(source);
      const output = template({
        htmlBody,
        login,
        actionURL,
      });

      return client.sendEmail({
        From: `${login}<${fromEmail}>`,
        To: commentAuthorEmails.toString(),
        Subject: subject,
        HtmlBody: output,
      });
    }
    return false;
  };

  const sendAutoRejectCommitEmail = (
    repositoryName,
    rejectedCommits,
    teamMemberEmails,
  ) => {
    if (validateEmails(teamMemberEmails.toString())) {
      const subject = `Re: [${repositoryName}] rejected_commits`;
      return client.sendEmailWithTemplate({
        From: fromEmail,
        To: teamMemberEmails.toString(),
        TemplateId: emailTemplate.AutoRejectedCommit,
        TemplateModel: {
          rejected_commits: rejectedCommits,
          commit_subject: subject,
          repository_name: repositoryName,
        },
      });
    }
    return false;
  };

  const sendNewProjectNotification = async (
    projectName,
    projectOwner,
    toEmail,
  ) => {
    if (validateEmails(toEmail)) {
      if (!newRepositoryNotifyEmails) {
        return { success: false };
      }
      const prjectHref = `${baseURL}/managerepositories`;

      return new Promise((resolve, reject) => {
        client.sendEmailWithTemplate(
          {
            From: fromEmail,
            To: toEmail,
            TemplateId: emailTemplate.NewProject,
            TemplateModel: {
              project_title: projectName,
              project_owner_name: projectOwner,
              project_href: prjectHref,
            },
          },
          (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          },
        );
      });
    }
    return false;
  };

  return {
    sendRejectedMail,
    systemRejectedCommitsEmail,
    sendCommitCommentEmail,
    sendAutoRejectCommitEmail,
    sendNewProjectNotification,
  };
};

module.exports = { createMailNotifications };
