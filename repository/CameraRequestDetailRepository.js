const sequelize = require("../config/database-connect");
const { Op, where } = require("sequelize");

exports.getGradeReport = async () => {
  const sql = `
    SELECT grade,
           count(grade)                                    AS amountOfStudentRegistered,
           count(CASE WHEN status = 'INACTIVE' THEN 1 END) AS amountOfStudentDeregistered
    FROM (
             SELECT LEFT(s.class_name, 1) AS grade, s.status
             FROM tbl_student s
                      JOIN (
                          SELECT a.student_id, MIN(a.date)
                          FROM tbl_attendance a
                          GROUP BY a.student_id
                      ) registered ON registered.student_id = s.id
         ) all_info
    GROUP BY grade
    ORDER BY grade;
  `;
  return await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
};

exports.findLatestUnsuccessfulInsertion = async () => {
  const sql = `SELECT s.id studentId, s.avatar dbAvatar, crd.created_at crd_date, crd.err_code, crd.avatar cameraAvatar, c.facesluice
            FROM tbl_student s
                     JOIN tbl_bus b ON s.bus_id = b.id
                     JOIN tbl_camera c ON b.id = c.bus_id
                     LEFT JOIN (SELECT crd2.*, cr2.created_at, cr2.camera_id
                                FROM (SELECT crd1.student_id, max(cr1.created_at) lastest
                                      FROM tbl_camera_request_detail crd1
                                               JOIN tbl_camera_request cr1 ON crd1.camera_request_id = cr1.id
                                      GROUP BY student_id) l
                                         JOIN tbl_camera_request cr2 ON l.lastest = cr2.created_at
                                         JOIN tbl_camera_request_detail crd2
                                              ON cr2.id = crd2.camera_request_id AND crd2.student_id = l.student_id) crd
                               ON s.id = crd.student_id AND c.facesluice = crd.camera_id
            WHERE crd.err_code is null OR crd.err_code != 0 OR s.avatar != crd.avatar
            ORDER BY c.facesluice`;
  return await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });
};
