const { tbl_user: User, tbl_role: Role, tbl_user_has_role: UserHasRole, tbl_driver: Driver, tbl_parent: Parent, tbl_teacher: Teacher, tbl_assistant: Assistant } = require('../model');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.createUser = async (userData, file) => {
  const { email, phone, name, gender, dob, address, role } = userData;
  const avatar = file ? file.originalname : null;
  const rawPassword = crypto.randomBytes(6).toString('base64');
  const hashPassword = await bcrypt.hash(rawPassword, 12);

  // Tạo user
  const user = await User.create({
    id: uuidv4(),
    name, gender, dob, email, phone, address,
    username: rawPassword,
    password: hashPassword,
    avatar,
    type: 'USER',
    status: 'ACTIVE'
  });

  // Gán role
  const roleUser = await Role.findOne({ where: { name: role } });
  await UserHasRole.create({
    id: uuidv4(),
    role_id: roleUser.id,
    user_id: user.id
  });

  // Tạo entity phụ
  if (role === 'PARENT') await Parent.create({ id: uuidv4(), userId: user.id });
  if (role === 'DRIVER') await Driver.create({ id: uuidv4(), userId: user.id });
  if (role === 'ASSISTANT') await Assistant.create({ id: uuidv4(), userId: user.id });
  if (role === 'TEACHER') await Teacher.create({ id: uuidv4(), userId: user.id });

  return user;
}; 