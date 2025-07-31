const { parse, format } = require("date-fns");
const { utcToZonedTime, zonedTimeToUtc } = require("date-fns-tz");

const DEFAULT_PATTERN = "yyyy-MM-dd HH:mm:ss";
const TIME_ZONE = "Asia/Ho_Chi_Minh";
/**
 * Chuyển string → JavaScript Date (giống convertStringToDate)
 * @param {string} dateString
 * @param {string} pattern
 * @returns {Date}
 */
function convertStringToDate(dateString, pattern = DEFAULT_PATTERN) {
  const parsedDate = parse(dateString, pattern, new Date());
  return zonedTimeToUtc(parsedDate, TIME_ZONE); // giống với Java Date (UTC)
}

/**
 * Chuyển Date → String với format (giống convertDateToString)
 * @param {Date} date
 * @param {string} pattern
 * @returns {string}
 */
function convertDateToString(date, pattern = DEFAULT_PATTERN) {
  const zoned = utcToZonedTime(date, TIME_ZONE);
  return format(zoned, pattern);
}
/**
 * Chuyển string → LocalDateTime (thực chất là Date trong JS)
 * @param {string} dateTimeStr
 * @returns {Date}
 */
function convertToLocalDateTime(dateTimeStr) {
  return convertStringToDate(dateTimeStr);
}

/**
 * Chuyển Date → LocalDateTime string (format mặc định)
 * @param {Date} date
 * @returns {string}
 */
function convertLocalDateTimeToString(date) {
  return convertDateToString(date);
}

module.exports = {
  convertStringToDate,
  convertDateToString,
  convertToLocalDateTime,
  convertLocalDateTimeToString,
};
