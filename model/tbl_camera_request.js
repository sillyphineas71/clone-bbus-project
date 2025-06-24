const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_camera_request', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    camera_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'tbl_camera',
        key: 'facesluice'
      }
    },
    request_type: {
      type: DataTypes.ENUM("ADD","DELETE","EDIT"),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("FAILED","SUCCESS"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_camera_request',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_camera_request_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
