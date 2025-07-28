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
} = require("../model");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const { Op, where } = require("sequelize");
const CheckpointPageResponse = require("../model/dto/response/checkpoint/CheckpointPageResponse");
const CheckpointWithStudentResponse = require("../model/dto/response/checkpoint/CheckpointWithStudentResponse");
const CheckpointWithTimeResponse = require("../model/dto/response/checkpoint/CheckpointWithTimeResponse");
const CheckpointResponse = require("../model/dto/response/checkpoint/CheckpointResponse");
const CheckpointWithRegisteredResponse = require("../model/dto/response/checkpoint/CheckpointWithRegisteredResponse");
const CheckpointWithStudentAndBusRequest = require("../model/dto/response/checkpoint/CheckpointWithStudentAndBusRequest");
const CheckpointWithAmountOfStudentResponse = require("../model/dto/response/checkpoint/CheckpointWithAmountOfStudentResponse");
const CheckpointWithAmountStudentPageResponse = require("../model/dto/response/checkpoint/CheckpointWithAmountStudentPageResponse");
exports.getCheckpointResponse = async (checkpoint) => {
  const checkpointResponse = await CheckPoint.findOne({
    where: { id: checkpoint.id },
  });
  return {
    id: checkpointResponse.id,
    name: checkpointResponse.name == null ? null : checkpointResponse.name,
    description:
      checkpointResponse.description == null
        ? null
        : checkpointResponse.description,
    latitude:
      checkpointResponse.latitude == null ? null : checkpointResponse.latitude,
    longitude:
      checkpointResponse.longitude == null
        ? null
        : checkpointResponse.longitude,
    status:
      checkpointResponse.status == null ? null : checkpointResponse.status,
  };
};

exports.getCheckpointPageResponse = async (
  page,
  size,
  totalEntitys,
  checkpointEntitys
) => {
  const checkpointResponses = [];
  for (const checkpoint of checkpointEntitys) {
    const checkpointResponse = await this.getCheckpointResponse(checkpoint);
    checkpointResponses.push(checkpointResponse);
  }
  return new CheckpointPageResponse(
    page,
    size,
    Math.ceil(totalEntitys / size),
    totalEntitys,
    checkpointResponses
  );
};

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
  let whereClause = {};
  if (keyword) {
    const searchQuery = `%${keyword.toLowerCase()}%`;
    whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: searchQuery } },
        { description: { [Op.iLike]: searchQuery } },
      ],
    };
  }
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalCheckpoint, rows: checkpoints } =
    await CheckPoint.findAndCountAll({
      where: whereClause,
      order,
      offset,
      limit: pageSize,
    });
  const result = await this.getCheckpointPageResponse(
    page,
    size,
    totalCheckpoint,
    checkpoints
  );
  return {
    status: 200,
    message: "checkpoint list",
    data: result,
  };
};

exports.getStudentsByCheckpoint = async (checkpointId) => {
  const checkpoint = await CheckPoint.findOne({
    where: { id: checkpointId },
    include: [
      {
        model: Student,
        as: "tbl_students",
        include: [{ model: Bus, as: "bus" }],
      },
    ],
  });
  if (!checkpoint) {
    return {
      status: 404,
      message: "checkpoint not found",
      data: null,
    };
  }
  const studentResponses = checkpoint.tbl_students.map((student) => {
    const isRegistered = student.bus != null;
    return new CheckpointWithStudentResponse(
      student.id,
      student.name,
      student.roll_number,
      isRegistered,
      isRegistered ? student.bus.id : null,
      isRegistered ? student.bus.name : null
    );
  });
  return {
    status: 200,
    message: "get students by checkpoint",
    data: studentResponses,
  };
};

exports.toggleCheckpointStatus = async (checkpointId) => {
  if (String(checkpointId) === "fdcb7b87-7cf4-4648-820e-b86ca2e4aa88") {
    return {
      status: 400,
      message: "Checkpoint gốc không thể chuyển trạng thái",
      data: null,
    };
  }
  const checkpoint = await CheckPoint.findOne({
    where: { id: checkpointId },
    include: [
      {
        model: Route,
        as: "route",
      },
    ],
  });
  if (!checkpoint) {
    return {
      status: 404,
      message: "Checkpoint not found",
      data: null,
    };
  }
  if (String(checkpoint.status) === "ACTIVE") {
    if (checkpoint.route != null) {
      return {
        status: 400,
        message:
          "Checkpoint đang thuộc một tuyến (route). Không thể chuyển sang INACTIVE.",
        data: null,
      };
    }
    checkpoint.status = "INACTIVE";
  } else {
    checkpoint.status = "ACTIVE";
  }
  await checkpoint.save();
  return {
    status: 200,
    message: "Checkpoint status toggled successfully",
  };
};
exports.getCheckpointsByRoute = async (routeId) => {
  const route = await Route.findOne({
    where: { id: routeId },
  });

  if (!route) {
    return {
      status: 404,
      message: "Route not found",
    };
  }

  const checkpointIds = route.path.split(" ").map((id) => id.trim());
  const checkpointTimes = String(route.checkpoint_time)
    .split(" ")
    .map((t) => t.trim());

  const checkpoints = await CheckPoint.findAll({
    where: {
      id: checkpointIds,
    },
  });

  const orderedCheckpoints = checkpointIds.map((id) =>
    checkpoints.find((cp) => cp.id === id)
  );

  const root = await CheckPoint.findOne({
    where: {
      id: "fdcb7b87-7cf4-4648-820e-b86ca2e4aa88",
    },
  });

  if (!root) {
    return {
      status: 404,
      message: "Root checkpoint not found",
    };
  }

  const responses = orderedCheckpoints
    .filter((cp) => cp)
    .map((cp, i) => {
      const time = i < checkpointTimes.length ? checkpointTimes[i] : null;
      return new CheckpointWithTimeResponse(
        cp.id,
        cp.name,
        cp.description,
        cp.latitude,
        cp.longitude,
        cp.status,
        time
      );
    });

  return {
    status: 200,
    message: "get checkpoints by route",
    data: responses,
  };
};

exports.getCheckpointsWithoutRoute = async () => {
  const checkpoints = await CheckPoint.findAll({
    where: {
      route_id: null,
    },
  });
  const root = await CheckPoint.findOne({
    where: {
      id: "fdcb7b87-7cf4-4648-820e-b86ca2e4aa88",
    },
  });
  if (!root) {
    return {
      status: 404,
      message: "Root checkpoint not found",
    };
  }
  const filteredCheckpoints = checkpoints.filter((cp) => cp.id !== root.id);
  const checkpointResponses = [];
  for (const checkpoint of filteredCheckpoints) {
    const response = await this.convertToResponse(checkpoint);
    checkpointResponses.push(response);
  }
  return {
    status: 200,
    message: "Lấy danh sách các điểm đón chưa thuộc tuyến thành công",
    data: checkpointResponses,
  };
};
exports.convertToResponse = async (checkpoint) => {
  return new CheckpointResponse(
    checkpoint.id,
    checkpoint.name,
    checkpoint.description,
    checkpoint.latitude,
    checkpoint.longitude,
    checkpoint.status
  );
};
exports.getCheckpointsWithRoute = async () => {
  const checkpoints = await CheckPoint.findAll({
    where: {
      route_id: { [Op.not]: null },
    },
  });
  const checkpointResponses = [];
  for (const checkpoint of checkpoints) {
    const response = await this.convertToResponse(checkpoint);
    checkpointResponses.push(response);
  }
  return {
    status: 200,
    message: "Lấy ra tất cả các điểm đón đã thuộc 1 tuyến thành công",
    data: checkpointResponses,
  };
};
exports.countStudentsInCheckpoint = async (checkpointId) => {
  const { count: totalStudent } = await Student.findAndCountAll({
    where: { checkpoint_id: checkpointId },
  });
  return {
    status: 200,
    message: "count all students in checkpoint (regardless of bus)",
    data: totalStudent,
  };
};
exports.getCheckpointDetail = async (checkpointId) => {
  const checkpoint = await CheckPoint.findByPk(checkpointId);
  const checkpointResponse = new CheckpointResponse(
    checkpoint.id,
    checkpoint.name,
    checkpoint.description,
    checkpoint.latitude,
    checkpoint.longitude,
    checkpoint.status
  );
  return {
    status: 200,
    message: "get checkpoint detail",
    data: checkpointResponse,
  };
};
exports.save = async (checkpointData) => {
  const existing = await CheckPoint.findOne({
    where: { name: checkpointData.checkpointName },
  });

  if (existing) {
    return {
      status: 400,
      message: "Checkpoint name is already existed",
      data: null,
    };
  }

  const checkpoint = await CheckPoint.create({
    id: uuidv4(),
    name: checkpointData.checkpointName,
    description: checkpointData.description,
    latitude: checkpointData.latitude,
    longitude: checkpointData.longitude,
    status: "ACTIVE",
  });

  return {
    status: 201,
    message: "Checkpoint created successfully",
    data: result,
  };
};
exports.update = async (checkpointData) => {
  const checkpoint = await CheckPoint.findByPk(checkpointData.id);
  if (!checkpoint) {
    return {
      status: 404,
      message: "checkpoint not found",
      data: null,
    };
  }
  checkpoint.name = checkpointData.checkpointName;
  checkpoint.description = checkpointData.description;
  checkpoint.latitude = checkpointData.latitude;
  checkpoint.longitude = checkpointData.longitude;

  await checkpoint.save();
  console.log("DATA", checkpoint);
  const result = await this.getCheckpointResponse(checkpoint);
  return {
    status: 200,
    message: "checkpoint updated successfully",
    data: result,
  };
};
exports.changeStatus = async (checkpointDataStatus) => {
  const checkpoint = await CheckPoint.findByPk(checkpointDataStatus.id);
  if (!checkpoint) {
    return {
      status: 404,
      message: "checkpoint not found",
      data: null,
    };
  }
  checkpoint.status = checkpointDataStatus.status;

  await checkpoint.save();
  return {
    status: 200,
    message: "checkpoint status changed successfully",
  };
};
exports.deleteCheckpoint = async (id) => {
  const checkpoint = await CheckPoint.findByPk(id);
  if (!checkpoint) {
    return {
      status: 404,
      message: "checkpoint not found",
      data: null,
    };
  }
  await checkpoint.destroy();
  return {
    status: 200,
    message: "checkpoint deleted successfully",
  };
};
exports.findAllWithAmountOfStudentRegister = async (keyword) => {
  const checkpoints = await CheckPoint.findAll();
  const students = await Student.findAll();

  let filterCheckpoint = checkpoints;

  if (keyword) {
    filterCheckpoint = checkpoints.filter((checkpoint) =>
      String(checkpoint.name).toLowerCase().includes(keyword.toLowerCase())
    );
  }

  const data = filterCheckpoint.map((checkpoint) => {
    const registered = students.filter(
      (student) =>
        student.checkpoint_id === checkpoint.id && student.status === "ACTIVE"
    ).length;

    const pending = students.filter(
      (student) =>
        student.checkpoint_id === checkpoint.id && student.status === "PENDING"
    ).length;

    return new CheckpointWithRegisteredResponse(
      checkpoint.id,
      checkpoint.name,
      registered,
      pending
    );
  });

  return {
    status: 200,
    message: "checkpoint list with amount of student register",
    data: data,
  };
};

exports.getDetailedWithStudentAndBus = async (checkpointId) => {
  const checkpoint = await CheckPoint.findOne({
    where: { id: checkpointId },
    include: [
      { model: Student, as: "tbl_students" },
      {
        model: Route,
        as: "route",
        include: [{ model: Bus, as: "tbl_buses" }],
      },
    ],
  });
  const result = new CheckpointWithStudentAndBusRequest(
    checkpoint.id,
    checkpoint.name,
    checkpoint.tbl_students?.map((student) => {
      return {
        id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        bus: student.bus_id,
      };
    }) || null,
    checkpoint.route.tbl_buses.map((bus) => {
      return {
        busId: bus.id,
        busName: bus.name,
        status: bus.status,
        licensePlate: bus.license_plate,
      };
    }) || null,
    checkpoint.status
  );
  return {
    status: 200,
    message: "checkpoint list with amount of student register",
    data: result,
  };
};
exports.getAnCheckpointWithStudentCount = async (keyword, sort, page, size) => {
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
  let whereClause = {};
  if (keyword) {
    const searchQuery = `%${keyword.toLowerCase()}%`;
    whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: searchQuery } },
        { description: { [Op.iLike]: searchQuery } },
      ],
    };
  }
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalCheckpoint, rows: checkpoints } =
    await CheckPoint.findAndCountAll({
      where: whereClause,
      order,
      offset,
      limit: pageSize,
    });

  const allAmountOfStudent = await Promise.all(
    checkpoints.map(async (checkpoint) => {
      const { count: amountOfStudent } = await Student.findAndCountAll({
        where: { checkpoint_id: checkpoint.id },
      });

      return {
        amountOfStudent,
        checkpointId: checkpoint.id,
      };
    })
  );
  const checkpointEntities = checkpoints.map((checkpoint) => {
    const matched = allAmountOfStudent.find(
      (item) => item.checkpointId === checkpoint.id
    );

    return {
      ...checkpoint.dataValues,
      amountOfStudent: matched ? matched.amountOfStudent : 0,
    };
  });
  const response = await this.getCheckpointWithAmountStudentPageResponse(
    page,
    size,
    totalCheckpoint,
    checkpointEntities
  );
  return {
    status: 200,
    message: "checkpoint list with amount of student register",
    data: response,
  };
};

exports.getCheckpointWithAmountStudentPageResponse = async (
  page,
  size,
  totalEntitys,
  checkpointEntities
) => {
  const checkpointList = checkpointEntities.map((entity) => {
    return new CheckpointWithAmountOfStudentResponse(
      entity.id,
      entity.name,
      entity.description,
      entity.latitude,
      entity.longitude,
      entity.status,
      entity.amountOfStudent
    );
  });
  return new CheckpointWithAmountStudentPageResponse(
    page,
    size,
    Math.ceil(totalEntitys / size),
    totalEntitys,
    checkpointList
  );
};
