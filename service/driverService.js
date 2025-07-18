const {
  tbl_user: User,
  tbl_role: Role,
  tbl_user_has_role: UserHasRole,
  tbl_driver: Driver,
  tbl_parent: Parent,
  tbl_teacher: Teacher,
  tbl_assistant: Assistant,
  tbl_student: Student,
  tbl_bus: Bus,
  tbl_checkpoint: CheckPoint,
  tbl_route: Route,
  tbl_camera: Camera,
  tbl_attendance: Attendence,
  tbl_bus_schedule: BusSchedule,
} = require("../model");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const DriverPageResponse = require("../model/dto/response/driver/DriverPageResponse");
const BusScheduleResponse = require("../model/dto/response/busSchedules/BusScheduleResponse");

exports.findAll = async (keyword, sort, page, size) => {
  let order = [["id", "ASC"]];
  if (sort) {
    const [column, direction] = sort.split(":");
    order = [
      [
        column,
        direction && direction.toUpperCase() === "DESC" ? "DESC" : "ASC",
      ],
    ];
  }
  // Tim tu khoa neu co
  const whereUser = keyword
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
        ],
      }
    : {};
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalDriver, rows: drivers } = await Driver.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
        where: whereUser,
      },
    ],
    order,
    offset,
    limit: size,
  });
  const result = this.getDriverPageResponse(page, size, totalDriver, drivers);

  return result;
};

exports.getAvaiableDrivers = async (keyword, sort, page, size) => {
  let order = [["id", "ASC"]];
  if (sort) {
    const [column, direction] = sort.split(":");
    order = [
      [
        column,
        direction && direction.toUpperCase() === "DESC" ? "DESC" : "ASC",
      ],
    ];
  }

  // 2. Xử lý keyword (tìm theo name, email, phone)
  keyword = keyword ? `%${keyword.toLowerCase()}%` : "%%";

  // 3. Phân trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  // 4. Lấy danh sách driverId đã được phân công (distinct)
  const assignedDriverIdsRaw = await BusSchedule.findAll({
    attributes: [
      [Sequelize.fn("DISTINCT", Sequelize.col("driver_id")), "driver_id"],
    ],
    where: {
      driver_id: {
        [Op.ne]: null,
      },
    },
    raw: true,
  });
  const assignedDriverIds = assignedDriverIdsRaw.map((item) => item.driver_id);
  // 5. Lọc driver chưa được phân công, tìm kiếm theo keyword
  const { count: totalDriver, rows: driverEntities } =
    await Driver.findAndCountAll({
      where: {
        id: {
          [Op.notIn]: assignedDriverIds,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          where: {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn("LOWER", Sequelize.col("user.name")),
                { [Op.like]: keyword }
              ),
              Sequelize.where(
                Sequelize.fn("LOWER", Sequelize.col("user.email")),
                { [Op.like]: keyword }
              ),
              Sequelize.where(
                Sequelize.fn("LOWER", Sequelize.col("user.phone")),
                { [Op.like]: keyword }
              ),
            ],
          },
        },
      ],
      order,
      offset,
      limit: pageSize,
    });

  return this.getDriverPageResponse(page, size, totalDriver, driverEntities);
};

exports.getDriverPageResponse = async (
  page,
  size,
  totalDriver,
  driverEntitys
) => {
  const drivers = driverEntitys.map((driver) => ({
    id: driver.id,
    name: driver.user.name,
    phone: driver.user.phone,
    email: driver.user.email,
    dob: driver.user.dob,
    address: driver.user.address,
    status: driver.user.status,
    avatar: driver.user.avatar,
    gender: driver.user.gender,
  }));

  const response = new DriverPageResponse(
    page,
    size,
    Math.ceil(totalDriver / size),
    totalDriver,
    drivers
  );
  return {
    status: 200,
    data: response,
  };
};

exports.findScheduleByDate = async (userID, date) => {
  const driver = await Driver.findByPk(userID);
  if (!driver) {
    return { status: 404, message: "Driver not found" };
  }
  const schedules = await BusSchedule.findAll({
    where: { date: date, driver_id: driver.user_id },
    order: [["direction", "DESC"]],
  });
  const result = schedules.map((schedule) => new BusScheduleResponse(schedule));
  return {
    status: 200,
    message: "schedule list",
    data: result,
  };
};

exports.findDriverScheduleByMonth = async (userID, year, month) => {
  const driver = await Driver.findByPk(userID);
  if (!driver) {
    return { status: 404, message: "Driver not found" };
  }
  const startdate = new Date(year, month - 1, 1);
  const enddate = new Date(year, month, 0); // Last day of the month

  const schedules = await BusSchedule.findAll({
    where: {
      driver_id: driver.id,
      date: {
        [Op.between]: [startdate, enddate],
      },
      direction: "PICK_UP",
    },
    order: [["date", "ASC"]],
  });
  const result = schedules.map((schedule) => new BusScheduleResponse(schedule));
  return {
    status: 200,
    message: "driver schedule list for month",
    data: result,
  };
};
