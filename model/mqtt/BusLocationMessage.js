class Gps {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }
}
class BusLocationMessage {
  constructor({ gps, time }) {
    this.gps = new Gps(gps.lat, gps.lng);
    this.time = time;
  }
}
module.exports = { BusLocationMessage, gps };
