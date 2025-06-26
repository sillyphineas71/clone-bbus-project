// config/database-connect.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("postgres", "postgres", "123", {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  dialect: "postgres",

  define: {
    underscored: true,
    timestamps: true,
    freezeTableName: false,
  },

  logging: console.log,
});

module.exports = sequelize;
