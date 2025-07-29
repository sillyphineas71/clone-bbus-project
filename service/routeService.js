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

const RoutePageResponse = require("../model/dto/response/route/RoutePageResponse");
const CheckpointResponse = require("../model/dto/response/checkpoint/CheckpointResponse");
const RouteResponseUpdate = require("../model/dto/response/route/RouteResponseUpdate");
const models = require("../model");
const { createCheckpoint } = require("../controller/checkpointController");
exports.getRouteResponse = async (route) => {
  const routeResponse = await Route.findByPk(route.id);
  return {
    id: routeResponse.id,
    code: routeResponse.code,
    description: routeResponse.description,
    path: routeResponse.path,
    checkpointTime: routeResponse.checkpoint_time,
    periodStart: routeResponse.period_start,
    periodEnd: routeResponse.period_end,
    createdAt: routeResponse.createdAt,
    updateAt: routeResponse.updatedAt,
  };
};
exports.getRoutePageResponse = async (
  page,
  size,
  totalEntities,
  routeEntities
) => {
  const routeResponse = [];
  for (const route of routeEntities) {
    const response = await this.getRouteResponse(route);
    routeResponse.push(response);
  }
  return new RoutePageResponse(
    page,
    size,
    Math.ceil(totalEntities / size),
    totalEntities,
    routeResponse
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
        { code: { [Op.iLike]: searchQuery } },
        { description: { [Op.iLike]: searchQuery } },
      ],
    };
  }
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalRoute, rows: routes } = await Route.findAndCountAll({
    where: whereClause,
    order,
    offset,
    limit: pageSize,
  });
  const result = await this.getRoutePageResponse(
    page,
    size,
    totalRoute,
    routes
  );
  return {
    status: 200,
    message: "Route list",
    data: result,
  };
};

exports.findById = async (routeId) => {
  const route = await Route.findByPk(routeId);
  if (!route) {
    return {
      status: 404,
      message: `Route with this ID not found: ${routeId}`,
    };
  }
  const result = await this.getRouteResponse(route);
  return {
    status: 200,
    message: "Route detail",
    data: result,
  };
};

exports.getRoutePathByBusId = async (busId) => {
  const bus = await Bus.findOne({
    where: { id: busId },
    include: [
      {
        model: Route,
        as: "route",
      },
    ],
  });
  if (!bus) {
    return {
      status: 404,
      message: "Bus not found",
      data: null,
    };
  }
  if (!bus.route) {
    return {
      status: 404,
      message: "Bus has no route assigned",
      data: null,
    };
  }
  return {
    status: 200,
    message: "get route by bus",
    data: bus.route.path,
  };
};
// kiem tra co trung route ton tai hay khong
exports.findRouteByCheckpointSet = async (newCheckpointIds) => {
  const routes = await Router.findAll();
  const fixedCheckpointId = "fdcb7b87-7cf4-4648-820e-b86ca2e4aa88";
  return routes.find((route) => {
    const routeCheckpointIds = route.path
      .split(" ")
      .filter((id) => id !== fixedCheckpointId);

    return (
      routeCheckpointIds.length === newCheckpointIds.length &&
      routeCheckpointIds.every((id) => newCheckpointIds.includes(id))
    );
  });
};

// Hàm kiểm tra thời gian
function isSortedAscending(times) {
  for (let i = 1; i < times.length; i++) {
    if (times[i] < times[i - 1]) return false;
  }
  return true;
}
function isSortedDescending(times) {
  for (let i = 1; i < times.length; i++) {
    if (times[i] > times[i - 1]) return false;
  }
  return true;
}

exports.save = async (routeCreate) => {
  const fixedCheckpointId = "fdcb7b87-7cf4-4648-820e-b86ca2e4aa88";
  const fixedCheckpointTime = "07:00/16:30";
  const newCheckpointIds = routeCreate.path
    .split(" ")
    .filter((id) => id != fixedCheckpointId);
  const checkpointTimes = routeCreate.checkpointTime.trim().split(/\s+/);
  const startTime = [];
  const endTime = [];
  for (const timePair of checkpointTimes) {
    const parts = timePair.split("/");
    if (parts.length == 2) {
      startTime.push(parts[0]);
      endTime.push(parts[1]);
    } else {
      return {
        status: 400,
        message: `Thời gian không hợp lệ ${timePair}`,
      };
    }
  }
  if (checkpointTimes.length !== newCheckpointIds.length) {
    return {
      status: 400,
      message: "Số lượng checkpoint và thời gian không khớp nhau.",
    };
  }
  if (isSortedAscending(startTime)) {
    return {
      status: 400,
      message: "Thời gian bắt đầu không được xếp tăng dần",
    };
  }
  if (isSortedDescending(endTime)) {
    return {
      status: 400,
      message: "Thời gian kết thúc không được xếp giảm dần",
    };
  }
  const isDuplicateRoute = await this.findRouteByCheckpointSet(
    newCheckpointIds
  );
  if (isDuplicateRoute) {
    return {
      status: 409,
      message: `Tuyến này đã được tạo và có tên là ${isDuplicateRoute.code}`,
    };
  }
  const lastRoute = await Route.findOne({
    order: [["code", "DESC"]],
  });
  const lastCode = lastRoute?.code || "R000";
  const nextNumber = parseInt(lastCode.substring(1)) + 1;
  const newCode = `R${String(nextNumber).padStart(3, "0")}`;

  const fullPath = [...newCheckpointIds, fixedCheckpointId].join(" ");
  const fullCheckpointTime = [...checkpointTimes, fixedCheckpointTime].join(
    " "
  );
  const route = await Route.create({
    id: uuidv4(),
    code: newCode,
    path: fullPath,
    checkpoint_time: fullCheckpointTime,
    description: routeCreate.description,
    period_start: routeCreate.periodStart,
    period_end: routeCreate.periodEnd,
  });
  return {
    status: 201,
    message: "create route",
    data: route,
  };
};
exports.updateRouteInfoAndCheckpoints = async (routeUpdateRequest) => {
  const fixedCheckpointId = "fdcb7b87-7cf4-4648-820e-b86ca2e4aa88";
  const route = await Route.findByPk(routeUpdateRequest.routeId);
  if (!route) {
    return { status: 404, message: "Không tìm thấy route với ID này." };
  }

  const rootCheckpoint = await Checkpoint.findByPk(fixedCheckpointId);
  if (!rootCheckpoint) {
    return { status: 404, message: "Không tìm thấy checkpoint gốc." };
  }

  // Lấy danh sách checkpoint hiện tại
  const currentCheckpoints = await Checkpoint.findAll({
    where: { route_id: route.id },
  });
  const currentCheckpointIds = [
    ...currentCheckpoints.map((cp) => cp.id),
    fixedCheckpointId,
  ];

  const newCheckpointIds = routeUpdateRequest.orderedCheckpointIds;
  const newCheckpoints = await Checkpoint.findAll({
    where: { id: newCheckpointIds },
  });

  if (newCheckpoints.length !== newCheckpointIds.length) {
    return {
      status: 400,
      message: "Có checkpoint không tồn tại trong danh sách gửi lên.",
    };
  }

  // Kiểm tra checkpoint đã thuộc route khác chưa
  for (const cp of newCheckpoints) {
    if (cp.route_id && cp.route_id !== route.id) {
      return {
        status: 400,
        message: `Checkpoint [${cp.name}] đã thuộc route khác.`,
      };
    }
  }

  // Tìm checkpoint bị xóa
  const checkpointsToRemove = currentCheckpointIds.filter(
    (id) => !newCheckpointIds.includes(id)
  );
  for (const checkpointId of checkpointsToRemove) {
    const hasStudent = await Student.count({
      where: { checkpoint_id: checkpointId },
    });
    if (hasStudent > 0) {
      const checkpoint = await Checkpoint.findByPk(checkpointId);
      return {
        status: 400,
        message: `Không thể xóa checkpoint [${checkpoint.name}] vì đang có học sinh đăng ký.`,
      };
    }
    await Checkpoint.update(
      { route_id: null },
      { where: { id: checkpointId } }
    );
  }

  // Gán checkpoint mới cho route
  const checkpointsToAdd = newCheckpointIds.filter(
    (id) => !currentCheckpointIds.includes(id)
  );
  for (const checkpointId of checkpointsToAdd) {
    await Checkpoint.update(
      { route_id: route.id },
      { where: { id: checkpointId } }
    );
  }

  // Check thời gian hợp lệ
  const checkpointTimes = routeUpdateRequest.orderedCheckpointTimes;
  if (checkpointTimes && newCheckpointIds.length !== checkpointTimes.length) {
    return {
      status: 400,
      message: "Số lượng checkpoint và thời gian không khớp nhau.",
    };
  }

  const startTime = [];
  const endTime = [];
  for (const timePair of checkpointTimes) {
    const parts = timePair.split("/");
    if (parts.length !== 2) {
      return { status: 400, message: `Thời gian không hợp lệ: ${timePair}` };
    }
    startTime.push(parts[0]);
    endTime.push(parts[1]);
  }

  if (isSortedAscending(startTime)) {
    return {
      status: 400,
      message: "Thời gian bắt đầu không được sắp xếp tăng dần.",
    };
  }
  if (isSortedDescending(endTime)) {
    return {
      status: 400,
      message: "Thời gian kết thúc không được sắp xếp giảm dần.",
    };
  }

  // Update lại path & checkpoint time
  const fullPath = [...newCheckpointIds, fixedCheckpointId].join(" ");
  const fullCheckpointTime = [...checkpointTimes, "07:00/16:30"].join(" ");

  await Route.update(
    {
      path: fullPath,
      checkpoint_time: fullCheckpointTime,
      description: routeUpdateRequest.description || route.description,
    },
    {
      where: { id: route.id },
    }
  );

  const result = await this.getRouteResponseUpdate(route.id);

  return {
    status: 200,
    message: "Cập nhật thành công",
    data: result,
  };
};

exports.getRouteResponseUpdate = async (routeId) => {
  const route = await Route.findByPk(routeId);
  if (!route) {
    throw new Error("Route not found");
  }

  const checkpointIdsInPathOrder = route.path
    ? route.path.split(" ").map((id) => id.trim())
    : [];

  const checkpointList = await Checkpoint.findAll({
    where: {
      id: {
        [Op.in]: checkpointIdsInPathOrder,
      },
    },
  });

  // Tạo map từ id => Checkpoint
  const checkpointMap = {};
  checkpointList.forEach((cp) => {
    checkpointMap[cp.id] = cp;
  });

  // Tạo danh sách CheckpointResponse theo đúng thứ tự từ path
  const checkpoints = checkpointIdsInPathOrder.map((id) => {
    const cp = checkpointMap[id];
    return new CheckpointResponse(
      cp.id,
      cp.name,
      cp.latitude,
      cp.longitude,
      cp.description,
      cp.status
    );
  });

  const orderedCheckpointTimes = route.checkpoint_time
    ? route.checkpoint_time.split(" ")
    : [];

  return new RouteResponseUpdate(
    route.id,
    route.code,
    route.description,
    checkpoints,
    orderedCheckpointTimes
  );
};
exports.deleteRoute = async (routeId) => {
  const route = await Route.findOne({
    where: { id: routeId },
    include: [
      {
        model: CheckPoint,
        as: "checkpoint",
        include: [
          {
            model: Student,
            as: "tbl_students",
          },
        ],
      },
    ],
  });
  if (!route) {
    return {
      status: 404,
      message: "Route không tồn tại",
    };
  }
  for (const checkpoint of route.checkpoint) {
    if (checkpoint.tbl_students) {
      return {
        status: 400,
        message: `Không thể xóa route vì checkpoint ${route.checkpoint.name} đang có học sinh đăng kí`,
      };
    }
  }
  for (const checkpoint of route.checkpoint) {
    checkpoint.route_id = null;
    await checkpoint.save();
  }
  await route.destroy();
  return {
    status: 200,
    message: "Xóa route thành công",
  };
};

exports.countTotalRoutes = () => {
  return Route.findAndCountAll()
    .then((result) => {
      return result.count;
    })
    .catch((error) => {
      throw new Error("Error counting routes: " + error.message);
    });
};
