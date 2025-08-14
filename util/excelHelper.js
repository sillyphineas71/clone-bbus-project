const XLSX = require("xlsx");
const axios = require("axios");
const dayjs = require("dayjs");
const path = require("path");
const s3Service = require("../service/s3Service"); // bạn đã có sẵn
const fs = require("fs");
const {
  tbl_user: User,
  tbl_parent: Parent,
  tbl_student: Student,
} = require("../model");
const PasswordUltils = require("./PasswordUtils");
exports.excelToStudents = async (filePath) => {
  const result = {
    validStudents: [],
    errorRows: {},
  };
  const rollNumbersInFile = new Set();
  try {
    // Đọc file Excel// excelToStudents(file.buffer)
    const workbook = XLSX.read(filePath, { type: "buffer" });
    console.log("A", workbook);
    const sheetName = workbook.SheetNames[0];
    console.log("B", sheetName);
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1, // đọc dạng mảng
      blankrows: false,
    });
    console.log("C", sheet);
    // Bỏ dòng header
    for (let i = 1; i < sheet.length; i++) {
      const row = sheet[i];

      console.log("ROW", row);
      const excelRow = i + 1; // dòng thực tế trong Excel
      let rowError = [];

      if (!row || row.every((cell) => cell === undefined || cell === "")) {
        result.errorRows[excelRow] = `Lỗi dòng ${excelRow}: Dòng trống.`;
        continue;
      }

      const [
        rollNumber,
        name,
        genderStr,
        dobStr,
        address,
        avatarUrl,
        parentPhone,
        className,
      ] = row.map((cell) => (cell || "").toString().trim());
      console.log(rollNumber);
      let s3Key = "";
      try {
        s3Key = avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
      } catch {
        rowError.push("Avatar không hợp lệ.");
      }

      // Validate dữ liệu trống
      if (!rollNumber) rowError.push("Mã học sinh không được để trống.");
      if (!name) rowError.push("Tên không được để trống.");
      if (!genderStr) rowError.push("Giới tính không được để trống.");
      if (!dobStr) rowError.push("Ngày sinh không được để trống.");
      if (!address) rowError.push("Địa chỉ không được để trống.");
      if (!avatarUrl) rowError.push("Avatar không được để trống.");
      if (!parentPhone)
        rowError.push("Số điện thoại phụ huynh không được để trống.");
      if (!className) rowError.push("Tên lớp không được để trống.");

      // Check trùng trong file
      if (rollNumber && rollNumbersInFile.has(rollNumber)) {
        rowError.push(`Mã học sinh '${rollNumber}' bị trùng trong file.`);
      } else {
        rollNumbersInFile.add(rollNumber);
      }

      // Giới tính hợp lệ
      const gender =
        genderStr === "Nam" ? "MALE" : genderStr === "Nữ" ? "FEMALE" : null;
      if (!gender) {
        rowError.push("Giới tính không hợp lệ.");
      }

      // Ngày sinh hợp lệ
      const dob = dayjs(dobStr, "YYYY-MM-DD", true);
      if (!dob.isValid()) {
        rowError.push("Định dạng ngày sinh không hợp lệ (yyyy-MM-dd).");
      }

      // Giả lập check parent trong DB (ở đây mình cho luôn là tồn tại)
      const parent = await Parent.findOne({
        include: [
          {
            model: User,
            as: "user",
            where: {
              phone: parentPhone,
            },
          },
        ],
      });

      // Upload ảnh lên S3
      if (avatarUrl) {
        try {
          const response = await axios({
            url: avatarUrl,
            method: "GET",
            responseType: "stream",
          });

          await s3Service.uploadFile(
            `students/${s3Key}`,
            response.data,
            parseInt(response.headers["content-length"], 10),
            response.headers["content-type"]
          );
          console.log(`Upload successful for: ${s3Key}`);
        } catch (err) {
          rowError.push("Lỗi tải lên ảnh đại diện, kiểm tra lại URL.");
        }
      }

      // Nếu có lỗi → lưu vào errorRows
      if (rowError.length > 0) {
        result.errorRows[excelRow] = `Lỗi dòng ${excelRow}: ${rowError.join(
          " "
        )}`;
      } else {
        result.validStudents.push({
          rollNumber,
          name,
          gender,
          dob: dob.format("YYYY-MM-DD"),
          address,
          avatar: s3Key,
          status: "ACTIVE",
          parentId: parent.id,
          className,
        });
      }
    }

    return result;
  } catch (err) {
    throw new Error(`Không thể đọc file Excel: ${err.message}`);
  }
};
exports.excelToUsers = async (fileBuffer, roleName) => {
  const result = {
    validUsers: [],
    errorRows: {},
  };

  const phonesInFile = new Set();
  const emailsInFile = new Set();

  try {
    // Đọc file Excel từ buffer
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Bỏ dòng tiêu đề
    if (rows.length > 1) {
      rows.shift();
    }

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // Excel index thực tế
      const row = rows[i];
      let rowError = "";

      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        result.errorRows[rowIndex] = `Lỗi dòng ${rowIndex}: Dòng trống.`;
        continue;
      }

      try {
        const phone = (row[0] || "").toString().trim();
        const name = (row[1] || "").toString().trim();
        const genderStr = (row[2] || "").toString().trim();
        const dobStr = (row[3] || "").toString().trim();
        const email = (row[4] || "").toString().trim();
        const avatarUrl = (row[5] || "").toString().trim();
        const address = (row[6] || "").toString().trim();

        let s3Key = "";
        if (avatarUrl) {
          s3Key = avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
        }

        // Upload avatar lên S3
        if (avatarUrl) {
          try {
            const response = await axios.get(avatarUrl, {
              responseType: "stream",
            });
            await s3Service.uploadFile(
              `${roleName.toLowerCase()}s/${s3Key}`,
              response.data,
              parseInt(response.headers["content-length"], 10),
              response.headers["content-type"]
            );
          } catch (e) {
            rowError += "Lỗi tải lên ảnh đại diện, kiểm tra lại URL. ";
          }
        }

        // Validate trùng trong file
        if (phonesInFile.has(phone)) {
          rowError += `Số điện thoại '${phone}' đã tồn tại trong file. `;
        } else {
          phonesInFile.add(phone);
        }
        if (emailsInFile.has(email)) {
          rowError += `Email '${email}' đã tồn tại trong file. `;
        } else {
          emailsInFile.add(email);
        }

        // Validate dữ liệu trống
        if (!phone) rowError += "Số điện thoại không được để trống. ";
        if (!name) rowError += "Tên không được để trống. ";
        if (!email) rowError += "Email không được để trống. ";
        if (!avatarUrl) rowError += "Avatar không được để trống. ";
        if (!address) rowError += "Địa chỉ không được để trống. ";
        if (!dobStr) rowError += "Ngày sinh không được để trống. ";

        // Validate độ dài sđt
        if (phone && phone.length !== 10) {
          rowError += "Số điện thoại phải có 10 chữ số. ";
        }

        // Validate format giới tính
        let gender = null;
        if (genderStr === "Nam") {
          gender = "MALE";
        } else if (genderStr === "Nữ") {
          gender = "FEMALE";
        } else {
          rowError += "Giới tính không hợp lệ. ";
        }

        // Validate ngày sinh
        let dob = null;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
          rowError += "Định dạng ngày sinh không hợp lệ (yyyy-MM-dd). ";
        } else {
          dob = dobStr;
        }

        const userSameEmail = await User.findOne({
          where: {
            email: email,
          },
        });
        if (userSameEmail) {
          rowError += "Email đã tồn tại. ";
        }
        const userSamePhone = await User.findOne({
          where: {
            phone: phone,
          },
        });
        if (userSamePhone) {
          rowError += "Số điện thoại đã tồn tại. ";
        }

        // Nếu có lỗi → lưu vào errorRows
        if (rowError) {
          result.errorRows[
            rowIndex
          ] = `Lỗi dòng ${rowIndex}: ${rowError.trim()}`;
        } else {
          const generatedPassword = PasswordUltils.generateRandomPassword();
          result.validUsers.push({
            username: generatedPassword,
            password: generatedPassword,
            phone,
            name,
            gender,
            dob,
            email,
            avatar: s3Key,
            address,
            role: roleName.toUpperCase(),
          });
        }
      } catch (err) {
        result.errorRows[
          rowIndex
        ] = `Lỗi dòng ${rowIndex}: Lỗi không xác định - ${err.message}`;
      }
    }

    return result;
  } catch (e) {
    throw new Error("Không thể đọc file Excel: " + e.message);
  }
};
