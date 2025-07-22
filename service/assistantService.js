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
const AssistantPageResponse = require("../model/dto/response/assistant/AssistantPageResponse");
const AssistantResponse = require("../model/dto/response/assistant/AssistantResponse");
const BusScheduleResponse = require("../model/dto/response/busSchedules/BusScheduleResponse");
const { Op, where } = require("sequelize");

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
  const { count: totalAssistant, rows: assistants } =
    await Assistant.findAndCountAll({
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
  const result = this.getAssistantPageResponse(
    page,
    size,
    totalAssistant,
    assistants
  );

  return result;
};
exports.getAvaiableAssistants = async (keyword, sort, page, size) => {
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

  // 4. Lấy danh sách assistant đã được phân công (distinct)
  const assignedAssistantIdsRaw = await BusSchedule.findAll({
    attributes: [
      [Sequelize.fn("DISTINCT", Sequelize.col("assistant_id")), "assistant_id"],
    ],
    where: {
      assistant_id: {
        [Op.ne]: null,
      },
    },
  });
  const assignedAssistantIds = assignedAssistantIdsRaw.map(
    (item) => item.assistant_id
  );
  // 5. Lọc assistant chưa được phân công, tìm kiếm theo keyword
  const { count: totalAssistant, rows: assistantEntities } =
    await Assistant.findAndCountAll({
      where: {
        id: {
          [Op.notIn]: assignedAssistantIds,
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

  return this.getAssistantPageResponse(
    page,
    size,
    totalAssistant,
    assistantEntities
  );
};

exports.getAssistantPageResponse = async (
  page,
  size,
  totalAssistant,
  assistantEntitys
) => {
  const assistants = assistantEntitys.map((assistant) => ({
    id: assistant.id,
    name: assistant.user.name,
    phone: assistant.user.phone,
    email: assistant.user.email,
    dob: assistant.user.dob,
    address: assistant.user.address,
    status: assistant.user.status,
    avatar: assistant.user.avatar,
    gender: assistant.user.gender,
  }));

  const response = new AssistantPageResponse(
    page,
    size,
    Math.ceil(totalAssistant / size),
    totalAssistant,
    assistants
  );
  return {
    status: 200,
    data: response,
  };
};
exports.findScheduleByDate = async (userID, date) => {
  const assistant = await Assistant.findOne({ where: { user_id: userID } });

  if (!assistant) {
    return { status: 404, message: "Assistant not found" };
  }
  const schedules = await BusSchedule.findAll({
    where: { date: date, assistant_id: assistant.id },
    order: [["direction", "DESC"]],
    include: [
      {
        model: Bus,
        as: "bus",
      },
      {
        model: Assistant,
        as: "assistant",
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      },
      {
        model: Driver,
        as: "driver",
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      },
      {
        model: Route,
        as: "route",
      },
    ],
  });
  console.log("Schedules:", schedules);
  const result = schedules.map((schedule) => new BusScheduleResponse(schedule));
  return {
    status: 200,
    message: "schedule list",
    data: result,
  };
};
exports.findAssistantScheduleByMonth = async (userID, year, month) => {
  const assistant = await Assistant.findOne({ where: { user_id: userID } });
  if (!assistant) {
    return { status: 404, message: "Assistant not found" };
  }
  const startdate = new Date(year, month - 1, 1);
  const enddate = new Date(year, month, 0); // Last day of the month
  console.log("Start Date:", startdate);
  console.log("End Date:", enddate);
  const schedules = await BusSchedule.findAll({
    where: {
      assistant_id: assistant.id,
      date: {
        [Op.between]: [startdate, enddate],
      },
      //  direction: "PICK_UP",
    },
    order: [["date", "ASC"]],
    include: [
      {
        model: Bus,
        as: "bus",
      },
      {
        model: Assistant,
        as: "assistant",
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      },
      {
        model: Driver,
        as: "driver",
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      },
      {
        model: Route,
        as: "route",
      },
    ],
  });
  console.log("Schedules for month:", schedules);
  const result = schedules.map((schedule) => new BusScheduleResponse(schedule));
  return {
    status: 200,
    message: "Assistant schedule list for month",
    data: result,
  };
};
