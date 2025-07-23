const eventService = require("../service/eventService");
const createError = require("http-errors");

exports.getEventDetail = (req, res, next) => {
  const eventName = req.params.eventName;

  eventService
    .findByName(eventName)
    .then((event) => {
      if (!event) {
        throw createError(404, `Event "${eventName}" not found`);
      }
      const e = event.get({ plain: true });
      const payload = {
        id: e.id,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        name: e.name,
        start: e.start_time,
        end: e.end_time,
      };

      res.status(200).json(payload);
    })
    .catch(next);
};

exports.createEvent = (req, res, next) => {
  eventService
    .createEvent(req.body)
    .then((event) => {
      const e = event.get({ plain: true });
      const payload = {
        id: e.id,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        name: e.name,
        start: e.start_time,
        end: e.end_time,
      };

      res.status(201).json({
        status: 200,
        message: "create event",
        data: payload,
      });
    })
    .catch(next);
};

exports.editEvent = (req, res, next) => {
  eventService
    .updateEvent(req.body)
    .then(() => {
      res.status(200).json({
        status: 200,
        message: "Event updated successfully",
      });
    })
    .catch(next);
};

exports.deleteEvent = (req, res, next) => {
  const name = req.params.eventName;

  eventService
    .deleteByName(name)
    .then(() => {
      res.status(200).type("text/plain").send("Event deleted successfully");
    })
    .catch(next);
};
