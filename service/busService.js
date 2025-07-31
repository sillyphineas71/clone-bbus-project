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
const { v4: uuidv4 } = require("uuid");
const { Op, where } = require("sequelize");
const BusPageRespone = require("../model/dto/response/bus/BusPageResponse");

exports.getBusResponse = async (bus) => {
  const busResponse = await Bus.findOne({
    where: { id: bus.id },
    include: [
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user" }],
      },
      {
        model: Assistant,
        as: "assistant",
        include: [{ model: User, as: "user" }],
      },
      {
        model: Route,
        as: "route",
      },
      {
        model: Camera,
        as: "tbl_camera",
      },
    ],
  });
  console.log("Bus Response:", busResponse.camera);
  return {
    id: busResponse.id,
    licensePlate: busResponse.license_plate,
    name: busResponse.name,
    driverId: busResponse.driver == null ? null : busResponse.driver.id,
    driverName:
      busResponse.driver == null ? null : busResponse.driver.user.name,
    driverPhone:
      busResponse.driver == null ? null : busResponse.driver.user.phone,
    assistantId:
      busResponse.assistant == null ? null : busResponse.assistant.id,
    assistantName:
      busResponse.assistant == null ? null : busResponse.assistant.user.name,
    assistantPhone:
      busResponse.assistant == null ? null : busResponse.assistant.user.phone,
    amountOfStudents:
      busResponse.amount_of_student == null ? 0 : busResponse.amount_of_student,
    routeId: busResponse.route == null ? null : busResponse.route.id,
    routeCode: busResponse.route == null ? null : busResponse.route.code,
    espId: busResponse.esp_id == null ? null : busResponse.esp_id,
    cameraFacesluice:
      busResponse.tbl_camera == null ? null : busResponse.tbl_camera.facesluice,
    busStatus: busResponse.status == null ? null : busResponse.status,
  };
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
  if (keyword) {
    const searchQuery = `%${keyword.toLowerCase()}%`;
    whereClause = {
      [Op.or]: [{ name: { [Op.iLike]: searchQuery } }],
    };
  }
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalBus, rows: buss } = await Bus.findAndCountAll({
    where: whereClause,
    order,
    offset,
    limit: size,
  });
  const result = await this.getBusResponses(page, size, totalBus, buss);

  return {
    status: 200,
    data: result,
  };
};

exports.findBusesByCheckpointId = async (checkPointId) => {
  if (!checkPointId) {
    return {
      status: 400,
      message: "Checkpoint ID is required",
    };
  }

  const checkpoint = await CheckPoint.findByPk(checkPointId);
  if (!checkpoint) {
    return {
      status: 404,
      message: "Checkpoint not found",
    };
  }
  const route = await Route.findByPk(checkpoint.route_id);
  console.log("Route:", route);
  if (!route) {
    return {
      status: 404,
      message: "Route not found",
    };
  }
  const buses = await Bus.findAll({
    where: { route_id: route.id },
  });
  const busResponses = [];
  for (const bus of buses) {
    const busResponse = await this.getBusResponse(bus);
    busResponses.push(busResponse);
  }
  return {
    status: 200,
    message: "get buses by checkpoint",
    data: busResponses,
  };
};
exports.getBusesByRouteId = async (routeId) => {
  if (!routeId) {
    return {
      status: 400,
      message: "Route ID is required",
    };
  }

  const route = await Route.findByPk(routeId);
  if (!route) {
    return {
      status: 404,
      message: "Route not found",
    };
  }
  const buses = await Bus.findAll({
    where: { route_id: route.id },
  });
  const busResponses = [];
  for (const bus of buses) {
    const busResponse = await this.getBusResponse(bus);
    busResponses.push(busResponse);
  }
  return {
    status: 200,
    message: "get buses by route",
    data: busResponses,
  };
};
exports.getBusById = async (busId) => {
  if (!busId) {
    return {
      status: 400,
      message: "Bus ID is required",
    };
  }
  const bus = await Bus.findOne({
    where: { id: busId },
  });
  if (!bus) {
    return {
      status: 404,
      message: "Bus not found",
    };
  }
  const busResponse = await this.getBusResponse(bus);
  return {
    status: 200,
    message: "get bus detail",
    data: busResponse,
  };
};
exports.saveBus = async (busData) => {
  const assistant = await Assistant.findOne({
    include: [
      {
        model: User,
        as: "user",
        where: {
          phone: busData.assistantPhone,
        },
      },
    ],
  });
  if (!assistant) {
    return {
      status: 404,
      message: "Assistant not found",
      data: null,
    };
  }
  const driver = await Driver.findOne({
    include: [
      {
        model: User,
        as: "user",
        where: {
          phone: busData.driverPhone,
        },
      },
    ],
  });
  if (!driver) {
    return {
      status: 404,
      message: "Driver not found",
      data: null,
    };
  }
  const route = await Route.findByPk(busData.route);
  if (!route) {
    return {
      status: 404,
      message: "Route not found",
      data: null,
    };
  }
  facesluice = `1${getEspId(busData.name)}`;
  const camera = await Camera.findOne({
    where: { facesluice: facesluice },
  });
  let newCamera;
  let isNewCamera = false;
  if (!camera) {
    newCamera = await Camera.create({
      facesluice: facesluice,
      status: "ACTIVE",
    });
    isNewCamera = true;
  }
  const bus = await Bus.create({
    id: uuidv4(),
    name: busData.name,
    license_plate: busData.licensePlate,
    assistant_id: assistant.id,
    driver_id: driver.id,
    route_id: route.id,
    status: "ACTIVE",
    esp_id: getEspId(busData.name),
  });
  if (isNewCamera) {
    newCamera.bus_id = bus.id;
    await newCamera.save();
  }
  const busResponse = await this.getBusResponse(bus);
  return {
    status: 201,
    message: "Bus created successfully",
    data: busResponse,
  };
};
exports.getBusResponses = async (page, size, totalEntitys, busEntitys) => {
  const busResponses = [];
  for (const bus of busEntitys) {
    const busResponse = await this.getBusResponse(bus);
    busResponses.push(busResponse);
  }
  return new BusPageRespone(
    page,
    size,
    Math.ceil(totalEntitys / size),
    totalEntitys,
    busResponses
  );
};
function getEspId(busName) {
  const numberPart = busName.replace(/\D+/g, "");

  if (!numberPart) {
    throw new Error("Bus name must contain a number part");
  }

  const number = parseInt(numberPart, 10);

  const formattedNumber = String(number).padStart(3, "0");

  return `${formattedNumber}001`;
}
exports.updateBus = async (busUpdate) => {
  const bus = await Bus.findByPk(busUpdate.id);
  if (!bus) {
    return {
      status: 404,
      message: "Bus not found",
      data: null,
    };
  }

  if (busUpdate.assistantPhone) {
    const assistant = await Assistant.findOne({
      include: [
        {
          model: User,
          as: "user",
          where: { phone: busUpdate.assistantPhone },
        },
      ],
    });
    if (assistant) {
      bus.assistant_id = assistant.id;
    }
  }

  if (busUpdate.driverPhone) {
    const driver = await Driver.findOne({
      include: [
        {
          model: User,
          as: "user",
          where: { phone: busUpdate.driverPhone },
        },
      ],
    });
    if (driver) {
      bus.driver_id = driver.id;
    }
  }
  if (busUpdate.licensePlate) {
    bus.license_plate = busUpdate.licensePlate;
  }
  await bus.save();
  console.log("Bus:", bus);
  const busResponse = await this.getBusResponse(bus);
  console.log("Bus RESPONSE:", busResponse);
  return {
    status: 200,
    message: "bus updated successfully",
    data: busResponse,
  };
};
exports.changeStatus = async (newStatus) => {
  const bus = await Bus.findByPk(newStatus.id);
  if (!bus) {
    return {
      status: 404,
      message: "Bus not found",
      data: null,
    };
  }

  bus.status = String(newStatus.status).toLocaleUpperCase();
  await bus.save();

  return {
    status: 200,
    message: "bus status changed successfully",
  };
};
exports.updateMaxCapacity = async (maxCapacity) => {
  await Bus.update(
    { max_capacity: parseInt(maxCapacity) },
    { where: { id: "00000000-0000-0000-0000-000000000000" } }
  );

  return {
    status: 201,
    message: "max capacity updated successfully",
  };
};
