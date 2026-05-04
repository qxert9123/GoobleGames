const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// 🔥 Proper WebSocket handling for Render
const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

let players = {};

function broadcast() {
  const data = JSON.stringify({
    type: "update",
    players
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2, 10);

  players[id] = {
    x: Math.random() * 700,
    y: Math.random() * 400
  };

  ws.send(JSON.stringify({
    type: "init",
    id,
    players
  }));

  broadcast();

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "move") {
        players[id] = data.pos;
        broadcast();
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    delete players[id];
    broadcast();
  });
});

app.get("/", (req, res) => {
  res.send("GoobleGames Server Running 🚀");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running");
});
