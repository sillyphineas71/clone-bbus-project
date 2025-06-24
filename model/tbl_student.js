const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_student', {
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bus_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_bus',
        key: 'id'
      }
    },
    checkpoint_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_checkpoint',
        key: 'id'
      }
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_parent',
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    class_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    roll_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "tbl_student_roll_number_key"
    },
    gender: {
      type: DataTypes.ENUM("FEMALE","MALE"),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("ACTIVE","INACTIVE","NONE"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_student',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_student_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tbl_student_roll_number_key",
        unique: true,
        fields: [
          { name: "roll_number" },
        ]
      },
    ]
  });
};
