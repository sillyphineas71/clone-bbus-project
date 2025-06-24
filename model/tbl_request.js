const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_request', {
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_user',
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
    request_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_request_type',
        key: 'id'
      }
    },
    send_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_user',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_student',
        key: 'id'
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reply: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("APPROVED","PENDING","REJECTED"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_request',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_request_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
