const webSocketHandle = require("./webSocketHandle");
const jwtHandshakeInterceptor = require("./JwtHandshakeInterceptor");

const WebSocket = require("ws");
const url = require("url");

class WebSocketConfig {
  constructor(webSocketHandle, jwtHandshakeInterceptor) {
    this.webSocketHandle = webSocketHandle;
    this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
  }

  registerWebSocketHandlers(server) {
    const wss = new WebSocket.Server({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
      const pathname = url.parse(request.url).pathname;

      if (pathname.startsWith("/ws/")) {
        // Có thể bật/tắt interceptor ở đây
        if (!this.jwtHandshakeInterceptor(request)) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on("connection", this.webSocketHandle);
  }
}

module.exports = WebSocketConfig;
