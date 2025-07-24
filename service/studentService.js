const { Op } = require("sequelize");
const { col } = require("sequelize");
const {
  tbl_student: Student,
  tbl_parent: Parent,
  tbl_checkpoint: Checkpoint,
  tbl_bus: Bus,
  tbl_user: User,
} = require("../model");
const s3Service = require("../service/s3Service");
const { v4: uuidv4 } = require("uuid");

module.exports.findAll = (keyword, sort = "id:asc", page = 0, size = 10) => {
  const [field = "id", dir = "asc"] = sort.split(":");
  const offset = (page > 0 ? page - 1 : 0) * size;
  const where = keyword ? { name: { [Op.iLike]: `%${keyword}%` } } : {};
  return Student.findAndCountAll({
    where,
    order: [[field, dir.toUpperCase()]],
    limit: size,
    offset,
  }).then(({ rows, count }) => ({
    totalElements: count,
    totalPages: Math.ceil(count / size),
    pageSize: rows.length,
    pageNumber: page,
    students: rows,
  }));
};

module.exports.getStudentsByBusId = (busId) => {
  return Student.findAll({
    where: { busId },
    attributes: [
      ["id", "studentId"],
      ["name", "studentName"],
      ["roll_number", "rollNumber"],
      "gender",
      "address",
      "status",
    ],
    include: [
      {
        model: Parent,
        as: "parent",
        attributes: ["parentName"],
      },
      {
        model: Checkpoint,
        as: "checkpoint",
        attributes: ["checkpointName"],
      },
    ],
  }).then((rows) =>
    rows.map((r) => ({
      studentId: r.get("studentId"),
      studentName: r.get("studentName"),
      rollNumber: r.get("rollNumber"),
      gender: r.gender,
      address: r.address,
      parentName: r.get("parentName"),
      checkpointName: r.get("checkpointName"),
      status: formatStatus(r.status),
    }))
  );
};

module.exports.findById = (studentId) => {
  return Student.findOne({
    where: { id: studentId },
    attributes: [
      "id",
      ["roll_number", "rollNumber"],
      "name",
      ["class_name", "className"],
      "avatar",
      "dob",
      "address",
      "gender",
      "status",
      ["parent_id", "parentId"],
      [col("bus.id"), "busId"],
      [col("bus.name"), "busName"],
      "createdAt",
      "updatedAt",
    ],
    include: [
      { model: Bus, as: "bus", attributes: [] },
      {
        model: Checkpoint,
        as: "checkpoint",
        attributes: [
          ["id", "checkpointId"],
          ["name", "checkpointName"],
          ["description", "checkpointDescription"],
        ],
      },
    ],
  }).then((student) => {
    if (!student) return null;
    const raw = student.toJSON();
    const fmt = (val) => {
      if (!val) return val;
      const s = typeof val === "string" ? val : val.toISOString();
      return s.replace(/Z$/, "+00:00");
    };
    const studentKey = `students/${raw.avatar}`;
    return s3Service
      .getPresignedUrl(studentKey)
      .catch(() => null)
      .then((stuUrl) => {
        if (!raw.parentId) {
          return { stuUrl, userRaw: null };
        }
        return Parent.findOne({
          where: { id: raw.parentId },
          include: [
            {
              model: User,
              as: "user",
              attributes: [
                ["id", "userId"],
                "username",
                "name",
                "gender",
                "dob",
                "email",
                "avatar",
                "phone",
                "address",
                "status",
                "createdAt",
                "updatedAt",
              ],
            },
          ],
        }).then((parentRec) => {
          return {
            stuUrl,
            userRaw:
              parentRec && parentRec.user ? parentRec.user.toJSON() : null,
          };
        });
      })
      .then(({ stuUrl, userRaw }) => {
        const parPromise =
          userRaw && userRaw.avatar
            ? s3Service
                .getPresignedUrl(`parents/${userRaw.avatar}`)
                .catch(() => null)
            : Promise.resolve(null);

        return Promise.all([
          Promise.resolve(stuUrl),
          parPromise,
          Promise.resolve(userRaw),
        ]);
      })
      .then(([stuUrl, parUrl, userRaw]) => {
        const parent = userRaw
          ? {
              userId: userRaw.userId,
              username: userRaw.username,
              name: userRaw.name,
              gender: userRaw.gender,
              dob:
                typeof userRaw.dob === "string"
                  ? userRaw.dob.split("T")[0]
                  : userRaw.dob.toISOString().split("T")[0],
              email: userRaw.email,
              avatar: parUrl,
              phone: userRaw.phone,
              address: userRaw.address,
              status: userRaw.status,
              role: "PARENT",
              createdAt: fmt(userRaw.createdAt),
              updatedAt: fmt(userRaw.updatedAt),
            }
          : null;
        const chk = raw.checkpoint || {};
        const checkpointId = chk.checkpointId || null;
        const checkpointName = chk.checkpointName || null;
        const checkpointDescription = chk.checkpointDescription || null;
        return {
          id: raw.id,
          rollNumber: raw.rollNumber,
          name: raw.name,
          className: raw.className,
          avatar: stuUrl,
          dob: fmt(raw.dob),
          address: raw.address,
          gender: raw.gender,
          status: raw.status,
          parentId: raw.parentId,
          busId: raw.busId,
          busName: raw.busName,
          parent,
          checkpointId,
          checkpointName,
          checkpointDescription,
          createdAt: fmt(raw.createdAt),
          updatedAt: fmt(raw.updatedAt),
        };
      });
  });
};

exports.save = (studentCreationRequest) => {
  const {
    rollNumber,
    name,
    className,
    dob,
    address,
    gender,
    status,
    parentId,
    avatar,
  } = studentCreationRequest;

  return Student.findOne({
    where: { roll_number: rollNumber },
  })
    .then((exists) => {
      if (exists) {
        throw new Error(
          `Student with this roll number: ${rollNumber} already exists`
        );
      }
      return Parent.findByPk(parentId);
    })
    .then((parent) => {
      if (!parent) {
        throw new Error("Parent not found");
      }
      // Lấy max trên cột roll_number
      return Student.max("roll_number", {
        where: { roll_number: { [Op.like]: "HS%" } },
      });
    })
    .then((latest) => {
      let nextIndex = 1;
      if (latest && latest.startsWith("HS")) {
        const num = parseInt(latest.slice(2), 10);
        if (isNaN(num)) {
          throw new Error(`Invalid roll number format in DB: ${latest}`);
        }
        nextIndex = num + 1;
      }
      const newRoll = `HS${String(nextIndex).padStart(5, "0")}`;
      const files = avatar || [];
      const avatarName = files[0]?.originalname || null;

      return Student.create({
        id: uuidv4(),
        roll_number: newRoll,
        name,
        class_name: className,
        dob,
        address,
        gender,
        status,
        avatar: avatarName,
        parent_id: parentId,
      });
    })
    .then((student) => {
      const file = (avatar || [])[0];
      if (file) {
        return s3Service
          .uploadFile(
            `students/${file.originalname}`,
            file.buffer,
            file.size,
            file.mimetype
          )
          .catch((uploadErr) => {
            console.error(
              "Upload student image failed while creating:",
              uploadErr.message
            );
          })
          .then(() => student);
      }
      return student;
    });
};

exports.update = (studentUpdateRequest) => {
  return Student.findOne({
    where: { roll_number: studentUpdateRequest.rollNumber },
  })
    .then((student) => {
      if (student) {
        if (student.id !== studentUpdateRequest.id) {
          throw new Error(`A student with this roll number already exists`);
        }
        student.id = studentUpdateRequest.id;
        student.roll_number = studentUpdateRequest.rollNumber;
        student.class_name = studentUpdateRequest.className;
        student.name = studentUpdateRequest.name;
        student.dob = studentUpdateRequest.dob;
        student.address = studentUpdateRequest.address;
        student.gender = studentUpdateRequest.gender;
        if (student.parent_id != null) {
          return Parent.findByPk(student.parent_id).then((parent) => {
            if (!parent) {
              throw new Error("Parent not found");
            }
            student.parent_id = studentUpdateRequest.parentId;
          });
        }
        if (student.checkpoint_id != null) {
          return Checkpoint.findByPk(student.checkpoint_id).then(
            (checkpoint) => {
              if (!checkpoint) {
                throw new Error("Checkpoint not found");
              }
              student.checkpoint_id = studentUpdateRequest.checkpointId;
            }
          );
        }
        return student.save();
      }
    })
    .then((updatedStudent) =>
      console.log("Student updated successfully:", updatedStudent)
    )
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.changeStatus = ({ id, status }) => {
  return Student.findByPk(id).then((student) => {
    if (!student) {
      throw createError(404, "Không tìm thấy student với id " + id);
    }
    return student.update({ status });
  });
};
