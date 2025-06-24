// config/database-connect.js
const { Sequelize } = require("sequelize");

<<<<<<< HEAD
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize("postgres", "postgres", "123456", {
  host: DB_HOST,
  port: DB_PORT,
=======
const sequelize = new Sequelize("postgres", "postgres", "123", {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
>>>>>>> 78b1ca508d29ff1dce985a8698c71a8d2e49dbb0
  dialect: "postgres",

  define: {
    underscored: true,
    timestamps: true,
    freezeTableName: false,
  },

  logging: console.log,
});

module.exports = sequelize;
