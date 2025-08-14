const crypto = require("crypto");

// Cấu hình độ dài và tập ký tự
const MIN_LENGTH = 8;
const MAX_LENGTH = 32;
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()-_=+[]{}|;:,.<>?/";
const ALL_CHARACTERS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

function getRandomInt(max) {
  return crypto.randomInt(0, max);
}

function shuffleString(input) {
  const arr = input.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function generateRandomPassword() {
  const length = 8; // hoặc có thể random trong khoảng [MIN_LENGTH, MAX_LENGTH]
  let password = "";

  password += UPPERCASE[getRandomInt(UPPERCASE.length)];

  password += DIGITS[getRandomInt(DIGITS.length)];

  for (let i = 2; i < length; i++) {
    password += ALL_CHARACTERS[getRandomInt(ALL_CHARACTERS.length)];
  }

  return shuffleString(password);
}

/**
 * Kiểm tra mật khẩu có hợp lệ theo policy:
 * - Độ dài từ MIN_LENGTH đến MAX_LENGTH
 * - Có ít nhất 1 chữ hoa
 * - Có ít nhất 1 chữ số
 */
function isValidPassword(password) {
  if (
    !password ||
    password.length < MIN_LENGTH ||
    password.length > MAX_LENGTH
  ) {
    return false;
  }
  const pattern = new RegExp(
    `^(?=.*[A-Z])(?=.*\\d).{${MIN_LENGTH},${MAX_LENGTH}}$`
  );
  return pattern.test(password);
}
