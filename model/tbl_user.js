const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_user', {
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: "tbl_user_phone_key"
    },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    device_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    platform: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "tbl_user_username_key"
    },
    version_app: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM("FEMALE","MALE"),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("ACTIVE","INACTIVE","NONE"),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM("SYSADMIN","USER"),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_user',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_user_phone_key",
        unique: true,
        fields: [
          { name: "phone" },
        ]
      },
      {
        name: "tbl_user_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tbl_user_username_key",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
