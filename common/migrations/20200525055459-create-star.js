'use strict';

const moment = require('moment')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Stars', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      dynamicId: {
        type: Sequelize.INTEGER(11),
        field: 'dynamic_id',
        unique: true,
        comment: '动态id'
      },
      userId: {
        type: Sequelize.INTEGER(11),
        field: 'user_id',
        unique: true,
        comment: '用户id'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
          return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
        }
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
          return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Stars');
  }
};