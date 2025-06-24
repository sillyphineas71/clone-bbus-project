const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_bus_schedule', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    assistant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_assistant',
        key: 'id'
      }
    },
    bus_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_bus',
        key: 'id'
      }
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_driver',
        key: 'id'
      }
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_route',
        key: 'id'
      }
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bus_schedule_status: {
      type: DataTypes.ENUM("CANCELLED","COMPLETED","EXPIRED","IN_PROGRESS","PENDING"),
      allowNull: true
    },
    direction: {
      type: DataTypes.ENUM("DROP_OFF","PICK_UP"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_bus_schedule',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_bus_schedule_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
