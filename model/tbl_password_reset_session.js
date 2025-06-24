const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_password_reset_session', {
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
    }
  }, {
    sequelize,
    tableName: 'tbl_password_reset_session',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_password_reset_session_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
