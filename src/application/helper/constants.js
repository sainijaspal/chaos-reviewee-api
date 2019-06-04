const enums = {
  filterStatus: {
    all: 0,
    rejectedOrToBeReviewed: 1,
    toBeReviewed: 2,
    rejected: 3,
    accepted: 4,
    rejectedByDeveloper: 5,
    rejectedBySystem: 6,
    markAsFixed: 7,
  },
  commitStatus: {
    Pending: 0,
    Accepted: 1,
    Rejected: 2,
    MarkAsFixed: 3,
  },
  repositoryRoles: {
    Admin: 1,
    Developer: 2,
    Reviewer: 3,
    Others: 4,
  },
  environment: {
    Production: 'Production',
    Development: 'Development',
    Test: 'test',
  },
  notificationType: {
    Rejected: 'Rejected',
    Comment: 'Comment',
  },
  emailTemplate: {
    AcceptedByUser: '3346666',
    RejectedCommit: '2399403',
    SystemRejectedCommits: '2653143',
    AutoRejectedCommit: '3335581',
    NewProject: '5782542',
  },
  WebhookActions: {
    Added: 'added',
    Created: 'created',
    Updated: 'updated',
    Edited: 'edited',
    Publicized: 'publicized',
    Privatized: 'privatized',
    Deleted: 'deleted',
    Archived: 'archived',
    Unarchived: 'unarchived',
    Removed: 'removed',
    MemberAdded: 'member_added',
    MemberInvited: 'member_invited',
    MemberRemoved: 'member_removed',
  },
  projectType: {
    YourProjects: 0,
    needsHelp: 1,
  },
  repositoryPermission: {
    Admin: 1,
    Developer: 2,
    Reviewer: 3,
  },
  webhookEvent: {
    Repository: 'repository',
    Push: 'push',
    Organization: 'organization',
    CommitComment: 'commit_comment',
    Member: 'member',
  },
};

const responseMessages = {
  commitAccepted: 'Commit has been accepted!!',
  commitRejected: 'Commit has been rejected!!.',
  commitMarkAsFixed: 'Commit has been fixed!!.',
  saveCommitComment: 'Comment has been posted in commit!!.',
};

module.exports = { enums, responseMessages };
