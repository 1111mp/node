'use strict';

const moment = require('moment')
const bcrypt = require('bcrypt')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER(11),
        // 设为主建
        primaryKey: true,
        // 自增
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(32),
        // 唯一
        unique: true,
        comment: '用户名'
      },
      pwd: {
        type: Sequelize.STRING(64),
        allowNull: false,
        set(val) {
          // 对密码进行加密
          const hash = bcrypt.hashSync(val, 10);
          this.setDataValue('pwd', hash);
        },
        comment: '用户密码'
      },
      email: {
        type: Sequelize.STRING(64),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: '用户邮箱'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
          // this.getDataValue 获取当前字段value
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
    }, {
      initialAutoIncrement: 10000
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};