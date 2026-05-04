const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
  res.send("Multiplayer Server Running 🚀");
});

let players = {};

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).substr(2, 9);

  players[id] = { x: 100, y: 100 };

  ws.send(JSON.stringify({ type: "init", id, players }));

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

  function broadcast() {
    const msg = JSON.stringify({ type: "update", players });

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running"));
