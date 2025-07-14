class SignInRequest {
  constructor({ phone, password, platform, deviceToken, versionApp }) {
    this.phone = phone;
    this.password = password;
    this.platform = platform;
    this.deviceToken = deviceToken;
    this.versionApp = versionApp;
  }
}

module.exports = SignInRequest;
