const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_student_has_grade', {
    period_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    grade_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_grade',
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
    }
  }, {
    sequelize,
    tableName: 'tbl_student_has_grade',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tbl_student_has_grade_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
