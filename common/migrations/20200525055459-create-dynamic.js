'use strict';

const moment = require('moment')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Dynamics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      userId: {
        type: Sequelize.INTEGER(11),
        unique: true,
        field: 'user_id',
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      content: {
        type: Sequelize.STRING(500)
      },
      star: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
          return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
        }
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
          return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Dynamics');
  }
};