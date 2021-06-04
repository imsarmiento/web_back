const WebSocket = require("ws");

const clients = [];

const wsUtils = () => {
  const wsu = {};

  wsu.setupWS = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
      clients.push(ws);
    });
  };

  wsu.notifyAll = (data) => {
    clients.forEach((c) => c.send(data));
  };

  return wsu;
};

module.exports = wsUtils();
