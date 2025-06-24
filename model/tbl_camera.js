const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_camera', {
    time_basic: {
      type: DataTypes.DATE,
      allowNull: true
    },
    time_heartbeat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bus_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_bus',
        key: 'id'
      },
      unique: "tbl_camera_bus_id_key"
    },
    facesluice: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'tbl_camera',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_camera_bus_id_key",
        unique: true,
        fields: [
          { name: "bus_id" },
        ]
      },
      {
        name: "tbl_camera_pkey",
        unique: true,
        fields: [
          { name: "facesluice" },
        ]
      },
    ]
  });
};
