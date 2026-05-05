const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/ws" });

// 🧠 rooms system
let rooms = {};

function getRoom(id) {
  if (!rooms[id]) {
    rooms[id] = {
      players: {}
    };
  }
  return rooms[id];
}

// 🔥 game loop (smooth updates)
setInterval(() => {
  for (let roomId in rooms) {
    let room = rooms[roomId];

    const data = JSON.stringify({
      type: "update",
      players: room.players
    });

    for (let p in room.players) {
      let ws = room.players[p].ws;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }
}, 50); // 20 FPS

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("room") || "default";

  const room = getRoom(roomId);

  const id = Math.random().toString(36).slice(2, 9);

  room.players[id] = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    ws
  };

  ws.send(JSON.stringify({
    type: "init",
    id
  }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "input") {
      const p = room.players[id];
      if (!p) return;

      // input-based movement (smooth)
      p.vx += data.dx * 0.5;
      p.vy += data.dy * 0.5;
    }
  });

  ws.on("close", () => {
    delete room.players[id];
  });
});

// 🔥 physics loop
setInterval(() => {
  for (let roomId in rooms) {
    let room = rooms[roomId];

    for (let id in room.players) {
      let p = room.players[id];

      p.x += p.vx;
      p.y += p.vy;

      p.vx *= 0.9;
      p.vy *= 0.9;
    }
  }
}, 50);

app.get("/", (req, res) => {
  res.send("Multiplayer server running 🚀");
});

server.listen(process.env.PORT || 3000);
