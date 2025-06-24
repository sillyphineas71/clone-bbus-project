const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_event', {
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_event',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_event_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
