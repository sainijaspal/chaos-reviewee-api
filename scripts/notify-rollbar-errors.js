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
        if (process.env.NODE_ENV === environment.Production) {
            httpRequest = createHttpRequest();
            helper = createHelper();
            sequelize = await createSequelize();
            services = createServices({ httpRequest, helper });
            const {
                repository: { getAllEnabledRollbarNotificationRepositories },
            } = createDAL({ sequelize, services, helper });
            const {
                slackServices: {
                    sendRollbarErrorsNotifications
                },
                rollbarServices: {
                    getRollbarErrorCount,
                }
            } = services;

            const current_date = new Date();
            if (current_date.getDay() != 0 && current_date.getDay() != 6) {//off schedule Job for weekend
                const repositories = await getAllEnabledRollbarNotificationRepositories();
                repositories.forEach(async (repository) => {
                    if (repository && repository.channel_name.length > 0) {
                        const staging_result = await getRollbarErrorCount(repository.uat_token);
                        const production_result = await getRollbarErrorCount(repository.production_token);
                        sendRollbarErrorsNotifications(repository, staging_result, production_result);
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
