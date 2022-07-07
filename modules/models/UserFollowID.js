let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const userFollowModal = sequelize_mysql.define(
  "users",
  {
    userfollowID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userfollowUserID: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userID: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    tableName: "usefollow",
  }
);

module.exports = userFollowModal;
