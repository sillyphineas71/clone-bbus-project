const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_role', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_role',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_role_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
