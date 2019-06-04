const createOrganizationDAL = ({
  sequelize: {
    models: { Organization },
  },
}) => {
  const create = async item => {
    delete item.id; // eslint-disable-line no-param-reassign
    return Organization.findOrCreate({
      where: {
        name: item.name,
      },
      defaults: item,
    });
  };

  const findById = async id =>
    Organization.find({
      where: {
        id,
      },
    });

  const update = async item =>
    Organization.update(item, {
      where: {
        id: item.id,
      },
    });

  const deleteOrganization = async team =>
    Organization.update(
      { is_active: false },
      {
        where: {
          id: team.id,
        },
      },
    );

  const findAll = async () =>
    Organization.findAll({
      where: {
        is_active: true,
      },
      raw: true,
    });

  const findAllActive = callback => {
    Organization.findAll({
      where: { isActive: true },
      attributes: ['webhookPath', 'webhookSecret'],
      raw: true,
    })
      .then(items => {
        callback(items);
      })
      .catch(error => {
        callback(error);
      });
  };

  return {
    create,
    findById,
    update,
    deleteOrganization,
    findAll,
    findAllActive,
  };
};

module.exports = { createOrganizationDAL };
