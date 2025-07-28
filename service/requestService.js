const { tbl_request: Request } = require("../model");

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
