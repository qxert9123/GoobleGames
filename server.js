const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// 🔥 WebSocket on /ws (important)
const wss = new WebSocket.Server({ server, path: "/ws" });

let players = {};

function broadcast() {
  const data = JSON.stringify({ type: "update", players });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Player connected");

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
    const data = JSON.parse(msg);
    if (data.type === "move") {
      players[id] = data.pos;
      broadcast();
    }
  });

  ws.on("close", () => {
    delete players[id];
    broadcast();
  });
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

server.listen(process.env.PORT || 3000);
