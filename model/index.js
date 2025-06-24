const sequelize = require("../config/database-connect");
const initModels = require("./init-models");
const models = initModels(sequelize);
module.exports = models;
