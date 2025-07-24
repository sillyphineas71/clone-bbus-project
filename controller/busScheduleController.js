const busScheduleService = require("../service/busScheduleService");

exports.getList = (req, res, next) => {
  const { keyword, sort } = req.query;
  let page = parseInt(req.query.page, 10);
  let size = parseInt(req.query.size, 10);

  if (isNaN(page)) page = 0;
  if (isNaN(size)) size = 10000;

  busScheduleService
    .findAll(page, size)
    .then((data) => {
      res.status(200).json({
        status: 200,
        message: "bus-schedule list",
        data: data,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getByMonth = (req, res, next) => {
  const { month, sort } = req.query;
  let page = parseInt(req.query.page, 10);
  let size = parseInt(req.query.size, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(size)) size = 10000;

  busScheduleService
    .findByMonth(month, sort, page, size)
    .then((data) => {
      res.status(200).json({
        status: 200,
        message: `bus-schedule list for ${month}`,
        data: data,
      });
    })
    .catch(next);
};

exports.getBusScheduleDatesByMonth = (req, res, next) => {
  const { month } = req.query;
  const sort = req.query.sort || "asc";
  const page = parseInt(req.query.page, 10) || 1;
  const size = parseInt(req.query.size, 10) || 10;

  busScheduleService
    .findDatesByMonth(month, sort, page, size)
    .then((data) => {
      res.status(200).json({
        status: 200,
        message: "get scheduled dates by month",
        data,
      });
    })
    .catch(next);
};

exports.assignBusScheduleBatch = (req, res, next) => {
  const dates = req.body.dates;
  busScheduleService
    .assignSchedulesForAllBusesOnDates(dates)
    .then((totalCreated) => {
      res.status(200).json({
        status: 200,
        message: "bus-schedule list",
        data: totalCreated,
      });
    })
    .catch(next);
};

exports.completeBusSchedule = (req, res, next) => {
  busScheduleService
    .completeBusSchedule(req.body)
    .then(() => {
      res.status(200).json({
        status: 200,
        message: "Bus schedule completed successfully",
      });
    })
    .catch(next);
};

exports.deleteSchedulesByDate = (req, res, next) => {
  const dateStr = req.query.date;
  if (!dateStr) {
    return res.status(400).json({
      status: 400,
      message: "You must provide a date in the query string",
    });
  }
  const date = new Date(dateStr);
  busScheduleService
    .deleteAllSchedulesByDate(date)
    .then(() => {
      res.status(200).json({
        status: 200,
        message: `Deleted all schedules and attendance on ${dateStr}`,
      });
    })
    .catch(next);
};
