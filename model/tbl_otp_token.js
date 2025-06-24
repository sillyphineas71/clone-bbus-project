const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_otp_token', {
    expire_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    otp: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_otp_token',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_otp_token_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
