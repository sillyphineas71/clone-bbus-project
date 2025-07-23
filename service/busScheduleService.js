const {
  tbl_bus_schedule: BusSchedule,
  tbl_bus: Bus,
  tbl_driver: Driver,
  tbl_assistant: Assistant,
  tbl_route: Route,
  tbl_student: Student,
  tbl_attendance: Attendance,
} = require("../model");
const { Op, fn, col } = require("sequelize");
const createError = require("http-errors");

exports.findAll = (page, size) => {
  const pageNo = page > 0 ? page - 1 : 0;
  const offset = pageNo * size;

  return BusSchedule.findAndCountAll({
    offset: offset,
    limit: size,
  }).then((result) => {
    const totalItems = result.count;
    const items = result.rows;
    const totalPages = Math.ceil(totalItems / size);
    return {
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: page,
      items: items,
    };
  });
};

exports.findByMonth = (monthStr, sort, page, size) => {
  const [year, month] = monthStr.split("-").map((v) => parseInt(v, 10));
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const pageNo = page > 0 ? page - 1 : 0;
  const offset = pageNo * size;
  let order = ["date", "ASC"];
  if (sort && typeof sort === "string") {
    const [col, dir] = sort.split(",").map((s) => s.trim());
    if (col) order = [col, dir.toUpperCase() === "DESC" ? "DESC" : "ASC"];
  }

  return BusSchedule.findAndCountAll({
    where: { date: { [Op.between]: [start, end] } },
    offset,
    limit: size,
    order: [order],
  }).then((result) => {
    const totalElements = result.count;
    const totalPages = Math.ceil(totalElements / size);

    return {
      pageNumber: page,
      pageSize: size,
      totalPages,
      totalElements,
      busSchedules: result.rows,
    };
  });
};

exports.findDatesByMonth = (monthStr, sort = "asc", page = 1, size = 10) => {
  const [year, month] = monthStr.split("-").map((v) => parseInt(v, 10));
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return BusSchedule.findAll({
    attributes: [[fn("date_trunc", "day", col("date")), "dateOnly"]],
    where: {
      date: { [Op.between]: [start, end] },
    },
    group: ["dateOnly"],
    raw: true,
  }).then((rows) => {
    const fullDates = rows
      .map((r) => new Date(r.dateOnly))
      .sort((a, b) => (sort.toLowerCase() === "desc" ? b - a : a - b));

    const totalElements = fullDates.length;
    const totalPages = Math.ceil(totalElements / size);
    const pageIndex = Math.max(0, page - 1);
    const from = pageIndex * size;
    const to = Math.min(from + size, totalElements);
    const pagedDates = fullDates.slice(from, to);
    return {
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      dates: pagedDates,
    };
  });
};

exports.assignSchedulesForAllBusesOnDates = (dates) => {
  let total = 0;

  return Bus.findAll()
    .then((buses) => {
      const work = [];

      buses.forEach((bus) => {
        const { id: busId, driverId, assistantId, routeId } = bus;
        if (!driverId || !assistantId || !routeId) return;

        dates.forEach((dateStr) => {
          const date = new Date(dateStr);
          ["PICK_UP", "DROP_OFF"].forEach((direction) => {
            work.push(
              BusSchedule.count({
                where: {
                  date,
                  busId,
                  driverId,
                  assistantId,
                  routeId,
                  direction,
                },
              }).then((count) => {
                if (count === 0) {
                  total++;
                  return BusSchedule.create({
                    date,
                    direction,
                    busScheduleStatus: "PENDING",
                    busId,
                    driverId,
                    assistantId,
                    routeId,
                  });
                }
              })
            );
          });
        });
      });

      return Promise.all(work);
    })
    .then(() => total);
};

exports.completeBusSchedule = ({ busScheduleId, note }) => {
  return BusSchedule.findByPk(busScheduleId).then((schedule) => {
    if (!schedule) {
      throw createError(404, "Không tìm thấy lịch xe");
    }
    const busId = schedule.getDataValue("bus_id");
    const date = schedule.getDataValue("date");
    const direction = schedule.getDataValue("direction");

    return Attendance.findAll({
      where: {
        bus_id: busId,
        date: date,
        direction: direction,
      },
    }).then((attList) => {
      if (attList.some((a) => a.status === "IN_BUS")) {
        throw createError(
          400,
          "Không thể kết thúc chuyến, vẫn còn học sinh trên xe!"
        );
      }
      return schedule.update({
        bus_schedule_status: "COMPLETED",
        note: note,
      });
    });
  });
};

exports.deleteAllSchedulesByDate = (date) => {
  return Attendance.destroy({
    where: { date: date },
  }).then(() => {
    return BusSchedule.destroy({
      where: { date: date },
    });
  });
};
