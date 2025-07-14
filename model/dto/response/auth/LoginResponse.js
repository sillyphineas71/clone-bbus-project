class LoginResponse {
  constructor(message, access_token, refresh_token) {
    this.message = message;
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }
}

module.exports = LoginResponse;
