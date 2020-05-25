'use strict';

const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  const Dynamic = sequelize.define('Dynamic', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11)
    },
    userId: {
      type: DataTypes.INTEGER(11),
      unique: true,
      field: 'user_id'
    },
    content: {
      type: DataTypes.STRING(500)
    },
    star: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
      }
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
      }
    }
  });

  Dynamic.associate = function (models) {
    // associations can be defined here
    Dynamic.hasMany(models.Comment)
    Dynamic.hasMany(models.Star)

    Dynamic.belongsTo(models.User, { foreignKey: 'user_id' })
  };

  return Dynamic;
};