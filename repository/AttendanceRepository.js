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

exports.routeReport = async () => {
  const sql = ` WITH route_path AS (
                SELECT
                    r.id,
                    r.description AS routeName,
                    string_agg(c.name, ' -> ' ORDER BY t.ord) AS pathName
                FROM tbl_route r
                         JOIN unnest(string_to_array(r.path, ' ')) WITH ORDINALITY AS t(checkpoint_id, ord)
                              ON TRUE
                         JOIN tbl_checkpoint c ON c.id::text = t.checkpoint_id
                GROUP BY r.id, r.description
            ),
                 student_count AS (
                     SELECT
                         r.id,
                         COUNT(CASE WHEN s.status = 'ACTIVE' THEN 1 END) AS amountOfStudent
                     FROM tbl_student s
                              JOIN tbl_checkpoint c ON s.checkpoint_id = c.id
                              JOIN tbl_route r ON c.route_id = r.id
                     GROUP BY r.id
                 ),
                 trip_count AS (
                     SELECT
                         r.id,
                         COUNT(*) AS amountOfTrip
                     FROM tbl_bus_schedule bs
                              JOIN tbl_route r ON bs.route_id = r.id
                     GROUP BY r.id
                 )
            SELECT
                rp.routeName,
                rp.pathName,
                sc.amountOfStudent,
                tc.amountOfTrip
            FROM route_path rp
                     JOIN student_count sc ON rp.id = sc.id
                     JOIN trip_count tc ON rp.id = tc.id;`;
  return await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });
};

exports.attendanceReport = async () => {
  const sql = `SELECT s.name,
                   s.roll_number,
                   COUNT(CASE WHEN a.date IS NOT NULL AND a.checkin IS NOT NULL THEN 1 END)     checkInNumber,
                   COUNT(CASE WHEN a.date IS NOT NULL AND a.checkout IS NOT NULL THEN 1 END)    checkOutNumber,
                   COUNT(CASE WHEN a.date IS NOT NULL AND a.checkin IS NOT NULL THEN 1 END) +
                   COUNT(CASE WHEN a.date IS NOT NULL AND a.checkout IS NOT NULL THEN 1 END) AS totalCheckInOut,
                   CASE
                       WHEN COUNT(CASE WHEN a.date IS NOT NULL AND a.checkin IS NOT NULL THEN 1 END) !=
                            COUNT(CASE WHEN a.date IS NOT NULL AND a.checkout IS NOT NULL THEN 1 END) THEN 'Có vấn đề'
                       ELSE 'Đi học đều' END                                                 AS note
            FROM tbl_attendance a
                     JOIN tbl_student s ON a.student_id = s.id
            GROUP BY s.name, s.roll_number;`;
  return await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });
};

exports.driverAndAssistantReport = async () => {
  const sql = `SELECT d.name   AS driver_name,
                   ast.name AS assistant_name,
                   ast.numberOfManualAttendance
            FROM (SELECT ast.id,
                         u.name,
                         COUNT(*) AS numberOfManualAttendance
                  FROM tbl_assistant ast
                           JOIN tbl_user u ON ast.user_id = u.id
                           LEFT JOIN tbl_attendance atd ON atd.modified_by = ast.id::varchar
                  GROUP BY ast.id, u.name) ast
                     JOIN tbl_bus b ON ast.id = b.assistant_id
                     JOIN (SELECT d.id,
                                  u.name
                           FROM tbl_driver d
                                    JOIN tbl_user u ON d.user_id = u.id) d ON b.driver_id = d.id;`;
  return await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });
};

exports.findAttendanceRate = async (startDate, endDate) => {
  const sql = `
    WITH month_series AS (
      SELECT TO_CHAR(generate_series(:startDate::date, :endDate::date, interval '1 month'), 'YYYY-MM') AS month
    ),
    attendance_summary AS (
      SELECT
        TO_CHAR(date, 'YYYY-MM') AS month,
        COUNT(*) FILTER (
          WHERE modified_by IS NOT NULL
            AND modified_by !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        ) AS non_uuid_count,
        COUNT(*) FILTER (WHERE modified_by IS NOT NULL) AS total_modified
      FROM tbl_attendance
      WHERE date BETWEEN :startDate::date AND :endDate::date
      GROUP BY TO_CHAR(date, 'YYYY-MM')
    )
    SELECT
      m.month,
      ROUND(100.0 * COALESCE(a.non_uuid_count, 0) / NULLIF(a.total_modified, 0), 2) AS non_uuid_percentage
    FROM month_series m
    LEFT JOIN attendance_summary a ON m.month = a.month
    ORDER BY m.month;
  `;

  return await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
    replacements: {
      startDate,
      endDate,
    },
  });
};
