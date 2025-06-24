const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_camera_request_detail', {
    err_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    person_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    camera_request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tbl_camera_request',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tbl_student',
        key: 'id'
      }
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    roll_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_camera_request_detail',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_camera_request_detail_pkey",
        unique: true,
        fields: [
          { name: "camera_request_id" },
          { name: "student_id" },
        ]
      },
    ]
  });
};
