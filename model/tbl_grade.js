const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_grade', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_teacher',
        key: 'id'
      },
      unique: "tbl_grade_teacher_id_key"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_grade',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_grade_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tbl_grade_teacher_id_key",
        unique: true,
        fields: [
          { name: "teacher_id" },
        ]
      },
    ]
  });
};
