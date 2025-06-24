const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_bus', {
    amount_of_student: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    esp_id: {
      type: DataTypes.STRING(6),
      allowNull: true,
      unique: "tbl_bus_esp_id_key"
    },
    assistant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_assistant',
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
    license_plate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "tbl_bus_license_plate_key"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "tbl_bus_name_key"
    },
    status: {
      type: DataTypes.ENUM("ACTIVE","INACTIVE"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_bus',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_bus_esp_id_key",
        unique: true,
        fields: [
          { name: "esp_id" },
        ]
      },
      {
        name: "tbl_bus_license_plate_key",
        unique: true,
        fields: [
          { name: "license_plate" },
        ]
      },
      {
        name: "tbl_bus_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "tbl_bus_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
