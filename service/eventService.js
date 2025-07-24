const { tbl_event: Event } = require("../model");
const createError = require("http-errors");
const { v4: uuidv4 } = require("uuid");

exports.findByName = (eventName) => {
  return Event.findOne({
    where: { name: eventName },
  });
};

exports.createEvent = ({ name, start, end }) => {
  return Event.findOne({ where: { name } }).then((existing) => {
    if (existing) {
      throw createError(400, "Event already exists");
    }
    return Event.create({
      id: uuidv4(),
      name,
      start_time: start,
      end_time: end,
    });
  });
};

exports.updateEvent = (data) => {
  const { name, start, end } = data;

  return Event.findOne({ where: { name } })
    .then((event) => {
      if (!event) {
        throw createError(404, `Event "${name}" not found`);
      }
      if (start) {
        event.start_time = start;
      }
      if (end) {
        event.end_time = end;
      }
      return event.save();
    })
    .then((updated) => {
      try {
        jobSchedulerService.schedulePickupDeadlineEvent(updated);
      } catch (err) {
        console.error("Failed to reschedule job for event", updated.id, err);
      }
      return updated;
    });
};

exports.deleteByName = (name) => {
  return Event.findOne({ where: { name } }).then((event) => {
    if (!event) {
      throw createError(404, `Event "${name}" not found`);
    }
    return Event.destroy({ where: { name } });
  });
};
