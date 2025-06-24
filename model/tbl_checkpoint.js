const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_checkpoint', {
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
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("ACTIVE","INACTIVE"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_checkpoint',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_checkpoint_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
