const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_route', {
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "tbl_route_code_key"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_route',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_route_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "tbl_route_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
