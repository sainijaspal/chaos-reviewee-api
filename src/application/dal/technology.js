const createTechnologyDAL = ({
  sequelize: {
    models: { Technology },
  },
}) => {
  const getAllTechnologies = async () =>
    Technology.findAll({
      where: {
        isActive: true,
      },
      attributes: ['id', 'name'],
      order: 'id',
    });

  return getAllTechnologies;
};

module.exports = { createTechnologyDAL };
