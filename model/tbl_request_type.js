const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_request_type', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    request_type_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "tbl_request_type_request_type_name_key"
    }
  }, {
    sequelize,
    tableName: 'tbl_request_type',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_request_type_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tbl_request_type_request_type_name_key",
        unique: true,
        fields: [
          { name: "request_type_name" },
        ]
      },
    ]
  });
};
