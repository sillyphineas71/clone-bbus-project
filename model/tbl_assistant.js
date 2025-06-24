const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_assistant', {
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
      },
      unique: "tbl_assistant_user_id_key"
    }
  }, {
    sequelize,
    tableName: 'tbl_assistant',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_assistant_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tbl_assistant_user_id_key",
        unique: true,
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
