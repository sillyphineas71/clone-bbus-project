const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_token', {
    expired: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_user',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    token_type: {
      type: DataTypes.ENUM("ACCESS_TOKEN","REFRESH_TOKEN"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_token',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_token_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
