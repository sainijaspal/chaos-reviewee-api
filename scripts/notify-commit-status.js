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

    try {
        const current_date = new Date();
        if (process.env.NODE_ENV === environment.Production && current_date.getDay() != 0 && current_date.getDay() != 6) {
            httpRequest = createHttpRequest();
            helper = createHelper();
            sequelize = await createSequelize();
            services = createServices({ httpRequest, helper });
            const {
                commit: { getCommitsReviewStatus },
            } = createDAL({ sequelize, services, helper });
            const {
                slackServices: { sendCurrentReviewStatusReport }
            } = services;

            const projects = await getCommitsReviewStatus();
            for (let project of projects) {
                if (project.channel_name && project.channel_name.length > 0 && project.today_commits_count > 0) {
                    await sendCurrentReviewStatusReport(project);
                }
            }
        }
    } catch (error) {
        reportError(error);
    } finally {
        await sequelize.close();
    }
})();
