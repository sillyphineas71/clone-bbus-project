const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_role_has_permission', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_permission',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_role',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_role_has_permission',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_role_has_permission_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
