const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_attendance', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    checkin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkout: {
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
    student_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_student',
        key: 'id'
      }
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_teacher',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    modified_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    direction: {
      type: DataTypes.ENUM("DROP_OFF","PICK_UP"),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("ABSENT","ATTENDED","IN_BUS"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_attendance',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_attendance_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
