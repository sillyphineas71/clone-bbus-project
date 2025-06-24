const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_driver', {
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
      unique: "tbl_driver_user_id_key"
    }
  }, {
    sequelize,
    tableName: 'tbl_driver',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_driver_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tbl_driver_user_id_key",
        unique: true,
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
