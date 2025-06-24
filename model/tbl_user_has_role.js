const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_user_has_role', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_role',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_user_has_role',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_user_has_role_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
