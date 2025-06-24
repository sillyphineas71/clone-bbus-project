const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_permission', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'tbl_permission',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_permission_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
