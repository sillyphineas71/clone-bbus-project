const { Sequelize } = require("sequelize");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize("postgres", "postgres", "123", {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  define: {
    timestamps: true,
    freezeTableName: false,
  },
  logging: console.log,
});

module.exports = sequelize;
