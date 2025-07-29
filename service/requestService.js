const {
  tbl_request: Request,
  tbl_request_type: RequestType,
  tbl_student: Student,
  tbl_user: User,
  tbl_checkpoint: Checkpoint,
  tbl_parent: Parent,
  tbl_bus: Bus,
  tbl_route: Route,
  tbl_attendance: Attendance,
} = require("../model");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("../config/database-connect");

module.exports.countPendingRequests = () => {
  return Request.findAndCountAll({
    where: {
      status: "PENDING",
    },
  })
    .then((result) => result.count)
    .catch((err) => {
      console.error("Error counting pending requests:", err);
      throw new Error("Database error while counting pending requests");
    });
};

module.exports.countTotalRequests = () => {
  return Request.findAndCountAll()
    .then((result) => result.count)
    .catch((err) => {
      console.error("Error counting total requests:", err);
      throw new Error("Database error while counting total requests");
    });
};
exports.findAll = (keyword = "", sort, page = 0, size = 10000) => {
  let column = "id";
  let direction = "ASC";
  if (sort) {
    const m = sort.match(/^(\w+?):(.+)$/);
    if (m) {
      column = m[1];
      direction = m[2].toUpperCase() === "DESC" ? "DESC" : "ASC";
    }
  }
  const pageNo = page > 0 ? page - 1 : 0;
  const offset = pageNo * size;
  const whereClause = keyword
    ? {
        [Op.or]: [
          { reason: { [Op.iLike]: `%${keyword.toLowerCase()}%` } },
          { reply: { [Op.iLike]: `%${keyword.toLowerCase()}%` } },
        ],
      }
    : {};
  return Request.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: RequestType,
        as: "request_type",
        attributes: ["id", "request_type_name"],
      },
      {
        model: Student,
        as: "student",
        attributes: ["id", "name"],
      },
      {
        model: User,
        as: "send_by_tbl_user",
        attributes: ["id", "name"],
      },
      {
        model: User,
        as: "approved_by_tbl_user",
        attributes: ["id", "name"],
      },
      {
        model: Checkpoint,
        as: "checkpoint",
        attributes: ["id", "name"],
      },
    ],
    order: [[column, direction]],
    offset,
    limit: size,
  }).then(({ count, rows }) => {
    const totalPages = Math.ceil(count / size);
    const requests = rows.map((r) => ({
      requestId: r.id,
      requestTypeId: r.request_type?.id || null,
      requestTypeName: r.request_type?.request_type_name || null,
      studentId: r.student?.id || null,
      studentName: r.student?.name || null,
      sendByUserId: r.send_by_tbl_user?.id || null,
      sendByName: r.send_by_tbl_user?.name || null,
      approvedByUserId: r.approved_by_tbl_user?.id || null,
      approvedByName: r.approved_by_tbl_user?.name || null,
      checkpointId: r.checkpoint?.id || null,
      checkpointName: r.checkpoint?.name || null,
      fromDate: r.from_date,
      toDate: r.to_date,
      reason: r.reason,
      reply: r.reply,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      pageNumber: page,
      pageSize: size,
      totalPages,
      totalElements: count,
      requests,
    };
  });
};

exports.findById = (id) => {
  return Request.findByPk(id, {
    include: [
      {
        model: RequestType,
        as: "request_type",
        attributes: ["id", "request_type_name"],
      },
      { model: Student, as: "student", attributes: ["id", "name"] },
      { model: User, as: "send_by_tbl_user", attributes: ["id", "name"] },
      { model: User, as: "approved_by_tbl_user", attributes: ["id", "name"] },
      { model: Checkpoint, as: "checkpoint", attributes: ["id", "name"] },
    ],
  }).then((r) => {
    if (!r) {
      const err = new Error(`Request not found`);
      err.statusCode = 404;
      throw err;
    }
    return {
      requestId: r.id,
      requestTypeId: r.request_type?.id || null,
      requestTypeName: r.request_type?.request_type_name || null,
      studentId: r.student?.id || null,
      studentName: r.student?.name || null,
      sendByUserId: r.send_by_tbl_user?.id || null,
      sendByName: r.send_by_tbl_user?.name || null,
      checkpointId: r.checkpoint?.id || null,
      checkpointName: r.checkpoint?.name || null,
      approvedByUserId: r.approved_by_tbl_user?.id || null,
      approvedByName: r.approved_by_tbl_user?.name || null,
      fromDate: r.from_date,
      toDate: r.to_date,
      reason: r.reason,
      reply: r.reply,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });
};

exports.getMyRequests = (userId, requestTypeId) => {
  const where = { send_by: userId };
  if (requestTypeId) {
    where.request_type_id = requestTypeId;
  }
  return Request.findAll({
    where,
    include: [
      {
        model: RequestType,
        as: "request_type",
        attributes: ["id", "request_type_name"],
      },
      { model: Student, as: "student", attributes: ["id", "name"] },
      { model: User, as: "send_by_tbl_user", attributes: ["id", "name"] },
      { model: User, as: "approved_by_tbl_user", attributes: ["id", "name"] },
      { model: Checkpoint, as: "checkpoint", attributes: ["id", "name"] },
    ],
    order: [["created_at", "DESC"]],
  }).then((rows) =>
    rows.map((r) => ({
      requestId: r.id,
      requestTypeId: r.request_type?.id || null,
      requestTypeName: r.request_type?.request_type_name || null,
      studentId: r.student?.id || null,
      studentName: r.student?.name || null,
      sendByUserId: r.send_by_tbl_user?.id || null,
      sendByName: r.send_by_tbl_user?.name || null,
      checkpointId: r.checkpoint?.id || null,
      checkpointName: r.checkpoint?.name || null,
      approvedByUserId: r.approved_by_tbl_user?.id || null,
      approvedByName: r.approved_by_tbl_user?.name || null,
      fromDate: r.from_date,
      toDate: r.to_date,
      reason: r.reason,
      reply: r.reply,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  );
};

exports.createRequest = (userId, req) => {
  if (!req.requestTypeId) {
    const e = new Error("RequestTypeId là bắt buộc");
    e.statusCode = 400;
    throw e;
  }
  return Promise.all([
    User.findByPk(userId),
    RequestType.findByPk(req.requestTypeId),
    Parent.findOne({ where: { user_id: userId } }),
    Request.findAll({ where: { send_by: userId } }),
  ])
    .then(([user, requestType, parent, existingRequests]) => {
      if (!user) {
        const e = new Error("User không tồn tại");
        e.statusCode = 404;
        throw e;
      }
      if (!requestType) {
        const e = new Error("RequestType không tồn tại");
        e.statusCode = 404;
        throw e;
      }
      if (!parent) {
        const e = new Error("Tài khoản phụ huynh không hợp lệ");
        e.statusCode = 403;
        throw e;
      }
      const today = new Date(),
        y = today.getFullYear(),
        m = today.getMonth(),
        d = today.getDate();
      const countToday = existingRequests.filter((r) => {
        if (r.request_type_id !== req.requestTypeId) return false;
        const cd = new Date(r.createdAt);
        return (
          cd.getFullYear() === y && cd.getMonth() === m && cd.getDate() === d
        );
      }).length;
      if (countToday >= 5) {
        const e = new Error(
          "Bạn đã gửi tối đa 5 đơn loại này trong ngày hôm nay. Vui lòng chờ xét duyệt các đơn trước đó trước khi gửi thêm."
        );
        e.statusCode = 400;
        throw e;
      }
      const dup = existingRequests.some(
        (r) =>
          r.request_type_id === req.requestTypeId &&
          (r.student_id || null) === (req.studentId || null) &&
          (r.checkpoint_id || null) === (req.checkpointId || null) &&
          r.reason === req.reason &&
          r.from_date?.toString() === req.fromDate?.toString() &&
          r.to_date?.toString() === req.toDate?.toString() &&
          r.status === "PENDING"
      );
      if (dup) {
        const e = new Error(
          "Bạn đã gửi 1 đơn giống nội dung này và đơn này đang trong quá trình xử lý. Vui lòng không gửi lại."
        );
        e.statusCode = 400;
        throw e;
      }
      const attrs = {
        id: uuidv4(),
        send_by: userId,
        request_type_id: req.requestTypeId,
        reason: req.reason,
        status: "PENDING",
      };
      const typeName = requestType.request_type_name.toLowerCase();
      if (typeName === "yêu cầu đổi điểm đón/trả cho học sinh") {
        if (!req.checkpointId) {
          const e = new Error("CheckpointId là bắt buộc");
          e.statusCode = 400;
          throw e;
        }
        attrs.checkpoint_id = req.checkpointId;
        if (req.studentId) {
          return Student.findByPk(req.studentId).then((student) => {
            if (!student) {
              const e = new Error("Không tìm thấy học sinh");
              e.statusCode = 404;
              throw e;
            }
            if (student.parent_id !== parent.id) {
              const e = new Error(
                "Học sinh không thuộc quyền quản lý của phụ huynh này"
              );
              e.statusCode = 409;
              throw e;
            }
            attrs.student_id = req.studentId;
            return Request.create(attrs);
          });
        }
        return Request.create(attrs);
      } else if (typeName === "đơn xin nghỉ học") {
        if (!req.studentId) {
          const e = new Error("StudentId là bắt buộc");
          e.statusCode = 400;
          throw e;
        }
        return Student.findByPk(req.studentId).then((student) => {
          if (!student) {
            const e = new Error("Không tìm thấy học sinh");
            e.statusCode = 404;
            throw e;
          }
          if (student.parent_id !== parent.id) {
            const e = new Error(
              "Học sinh không thuộc quyền quản lý của phụ huynh này"
            );
            e.statusCode = 409;
            throw e;
          }
          attrs.student_id = req.studentId;
          attrs.from_date = req.fromDate;
          attrs.to_date = req.toDate;
          return Request.create(attrs);
        });
      } else if (typeName === "đơn khác") {
        return Request.create(attrs);
      } else {
        const e = new Error("Loại đơn không hợp lệ");
        e.statusCode = 400;
        throw e;
      }
    })
    .then((newReq) =>
      Request.findByPk(newReq.id, {
        include: [
          {
            model: RequestType,
            as: "request_type",
            attributes: ["id", "request_type_name"],
          },
          { model: Student, as: "student", attributes: ["id", "name"] },
          { model: User, as: "send_by_tbl_user", attributes: ["id", "name"] },
          {
            model: User,
            as: "approved_by_tbl_user",
            attributes: ["id", "name"],
          },
          { model: Checkpoint, as: "checkpoint", attributes: ["id", "name"] },
        ],
      })
    )
    .then((r) => ({
      requestId: r.id,
      requestTypeId: r.request_type?.id,
      requestTypeName: r.request_type?.request_type_name,
      studentId: r.student?.id || null,
      studentName: r.student?.name || null,
      sendByUserId: r.send_by_tbl_user?.id,
      sendByName: r.send_by_tbl_user?.name,
      checkpointId: r.checkpoint?.id || null,
      checkpointName: r.checkpoint?.name || null,
      approvedByUserId: r.approved_by_tbl_user?.id || null,
      approvedByName: r.approved_by_tbl_user?.name || null,
      fromDate: r.from_date,
      toDate: r.to_date,
      reason: r.reason,
      reply: r.reply,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
};

exports.replyRequest = (userId, payload) => {
  return Promise.all([
    User.findByPk(userId),
    Request.findByPk(payload.requestId),
  ])
    .then(([user, request]) => {
      if (!request) {
        const err = new Error("Request not found");
        err.statusCode = 400;
        throw err;
      }
      request.approved_by = payload.approvedByUserId || user.id;
      request.reply = payload.reply;
      request.status = payload.status;
      return request.save();
    })
    .then((savedRequest) => {
      return Request.findByPk(savedRequest.id, {
        include: [
          {
            model: RequestType,
            as: "request_type",
            attributes: ["id", "request_type_name"],
          },
          { model: Student, as: "student", attributes: ["id", "name"] },
          { model: Checkpoint, as: "checkpoint", attributes: ["id", "name"] },
          { model: User, as: "send_by_tbl_user", attributes: ["id", "name"] },
          {
            model: User,
            as: "approved_by_tbl_user",
            attributes: ["id", "name"],
          },
        ],
      });
    })
    .then((updated) => {
      const r = updated.get({ plain: true });
      return {
        requestId: r.id,
        requestTypeId: r.request_type.id,
        requestTypeName: r.request_type.request_type_name,
        studentId: r.student.id,
        studentName: r.student.name,
        sendByUserId: r.send_by_tbl_user.id,
        sendByName: r.send_by_tbl_user.name,
        checkpointId: r.checkpoint.id,
        checkpointName: r.checkpoint.name,
        approvedByUserId: r.approved_by_tbl_user.id,
        approvedByName: r.approved_by_tbl_user.name,
        fromDate: r.from_date,
        toDate: r.to_date,
        reason: r.reason,
        reply: r.reply,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });
};

exports.processChangeCheckpointRequest = (userId, requestId) => {
  return sequelize.transaction((t) => {
    let requestInstance,
      parentEntity,
      newCheckpoint,
      targetStudents,
      busesInRoute,
      oldBuses,
      requiredSlots,
      targetBus;
    return Request.findByPk(requestId, {
      include: [
        {
          model: RequestType,
          as: "request_type",
          attributes: ["request_type_name"],
        },
      ],
      transaction: t,
    })
      .then((req) => {
        if (!req) {
          const e = new Error("Không tìm thấy đơn yêu cầu");
          e.statusCode = 404;
          throw e;
        }
        requestInstance = req;
        if (req.status !== "PENDING") {
          const e = new Error("Đơn đã xử lý hoặc không hợp lệ");
          e.statusCode = 400;
          throw e;
        }
        if (
          req.request_type.request_type_name.toLowerCase() !==
          "yêu cầu đổi điểm đón/trả cho học sinh"
        ) {
          const e = new Error("Loại đơn không hợp lệ");
          e.statusCode = 400;
          throw e;
        }
        return User.findByPk(req.send_by, { transaction: t });
      })
      .then((user) => {
        if (!user) {
          const e = new Error("Không tìm thấy phụ huynh gửi đơn");
          e.statusCode = 404;
          throw e;
        }
        return Parent.findOne({
          where: { user_id: user.id },
          transaction: t,
        });
      })
      .then((parent) => {
        if (!parent) {
          const e = new Error("Không tìm thấy phụ huynh gửi đơn");
          e.statusCode = 404;
          throw e;
        }
        parentEntity = parent;
        return Checkpoint.findByPk(requestInstance.checkpoint_id, {
          transaction: t,
        });
      })
      .then((cp) => {
        if (!cp) {
          const e = new Error("Checkpoint mới không hợp lệ");
          e.statusCode = 400;
          throw e;
        }
        newCheckpoint = cp;
        return Route.findByPk(cp.route_id, { transaction: t });
      })
      .then((route) => {
        if (!route) {
          const e = new Error("Route của checkpoint không tồn tại");
          e.statusCode = 400;
          throw e;
        }
        return Bus.findAll({ where: { route_id: route.id }, transaction: t });
      })
      .then((buses) => {
        busesInRoute = buses;
        if (requestInstance.student_id) {
          return Student.findByPk(requestInstance.student_id, {
            transaction: t,
          }).then((stu) => {
            if (!stu) {
              const e = new Error("Không tìm thấy học sinh");
              e.statusCode = 404;
              throw e;
            }
            targetStudents = [stu];
          });
        }
        return Student.findAll({
          where: { parent_id: parentEntity.id },
          transaction: t,
        }).then((stus) => {
          if (!stus.length) {
            const e = new Error("Phụ huynh không có học sinh nào");
            e.statusCode = 404;
            throw e;
          }
          targetStudents = stus;
        });
      })
      .then(() =>
        Promise.all(
          targetStudents.map((s) =>
            s.bus_id
              ? Bus.findByPk(s.bus_id, { transaction: t })
              : Promise.resolve(null)
          )
        )
      )
      .then((buses) => {
        oldBuses = buses;
        const needChangeIdx = buses
          .map((b, i) => (!b || b.route_id !== newCheckpoint.route_id ? i : -1))
          .filter((i) => i >= 0);
        requiredSlots = needChangeIdx.length;
        if (requiredSlots === 0) {
          targetBus = oldBuses[0] || null;
          requestInstance.status = "APPROVED";
          requestInstance.approved_by = userId;
          requestInstance.reply = "Không cần thay đổi xe";
          return requestInstance
            .save({ transaction: t })
            .then(() => {
              if (!targetBus) return { __final: null };
              return Bus.findByPk(targetBus.id, { transaction: t });
            })
            .then((finalBus) => {
              if (!finalBus) return { __final: null };
              const fmt = (d) => d.toISOString().slice(0, 10);
              return {
                __final: {
                  busId: finalBus.id,
                  busName: finalBus.name,
                  licensePlate: finalBus.license_plate,
                  maxCapacity: finalBus.max_capacity,
                  amountOfStudent: finalBus.amount_of_student,
                  checkpointId: newCheckpoint.id,
                  checkpointName: newCheckpoint.name,
                  checkpointDescription: newCheckpoint.description,
                  createdAt: fmt(requestInstance.createdAt),
                  updatedAt: fmt(requestInstance.updatedAt),
                },
              };
            });
        }
        targetBus = busesInRoute.find(
          (b) => b.max_capacity - b.amount_of_student >= requiredSlots
        );
        if (!targetBus) {
          requestInstance.status = "REJECTED";
          requestInstance.reply =
            "Không có xe nào thuộc tuyến mới đủ chỗ trống";
          return requestInstance
            .save({ transaction: t })
            .then(() => ({ __final: null }));
        }
        return Promise.all(
          needChangeIdx.map((i) => {
            const student = targetStudents[i];
            const oldBus = oldBuses[i];
            const needsChange =
              !!targetBus && (!oldBus || oldBus.id !== targetBus.id);

            const p1 =
              needsChange && oldBus
                ? oldBus.decrement("amount_of_student", {
                    by: 1,
                    transaction: t,
                  })
                : Promise.resolve();

            const p2 = student.update(
              {
                checkpoint_id: newCheckpoint.id,
                bus_id: needsChange ? targetBus.id : oldBus ? oldBus.id : null,
              },
              { transaction: t }
            );

            const p3 = Attendance.findAll({
              where: {
                student_id: student.id,
                date: { [Op.gt]: new Date() },
              },
              transaction: t,
            }).then((atts) =>
              Promise.all(
                atts.map((att) => {
                  att.checkpoint_id = newCheckpoint.id;
                  if (needsChange) att.bus_id = targetBus.id;
                  return att.save({ transaction: t });
                })
              )
            );

            return Promise.all([p1, p2, p3]);
          })
        ).then(() => ({ __continue: true }));
      })
      .then((marker) => {
        if (marker && marker.__final !== undefined) {
          return marker.__final;
        }
        if (!marker || !marker.__continue) {
          return null;
        }

        return targetBus
          .increment("amount_of_student", {
            by: requiredSlots,
            transaction: t,
          })
          .then(() => {
            requestInstance.status = "APPROVED";
            requestInstance.approved_by = userId;
            requestInstance.reply =
              "Đã cập nhật checkpoint và xe mới cho học sinh.";
            return requestInstance.save({ transaction: t });
          })
          .then(() =>
            Bus.findByPk(targetStudents[0].bus_id, { transaction: t })
          )
          .then((finalBus) => {
            if (!finalBus) return null;
            const fmt = (d) => d.toISOString().slice(0, 10);
            return {
              busId: finalBus.id,
              busName: finalBus.name,
              licensePlate: finalBus.license_plate,
              maxCapacity: finalBus.max_capacity,
              amountOfStudent: finalBus.amount_of_student,
              checkpointId: newCheckpoint.id,
              checkpointName: newCheckpoint.name,
              checkpointDescription: newCheckpoint.description,
              createdAt: fmt(requestInstance.createdAt),
              updatedAt: fmt(requestInstance.updatedAt),
            };
          });
      });
  });
};
