const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// WebSocket on /ws
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

// 🔥 THIS IS THE IMPORTANT PART — SERVE THE GAME
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>GoobleGames</title>
<style>
body { margin:0; background:#111; color:white; }
canvas { display:block; margin:auto; background:#222; }
#status { position:fixed; top:10px; left:10px; }
</style>
</head>
<body>

<div id="status">Connecting...</div>
<canvas id="c" width="800" height="500"></canvas>

<script>
const statusDiv = document.getElementById("status");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const ws = new WebSocket("wss://gooblegames-1.onrender.com/ws");

let id = null;
let players = {};
let me = { x: 100, y: 100 };

ws.onopen = () => statusDiv.textContent = "CONNECTED ✅";
ws.onerror = () => statusDiv.textContent = "ERROR ❌";
ws.onclose = () => statusDiv.textContent = "CLOSED ⚠️";

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === "init") {
    id = data.id;
    players = data.players;
  }

  if (data.type === "update") {
    players = data.players;
  }
};

document.addEventListener("keydown", (e) => {
  if (!id) return;

  if (e.key === "w") me.y -= 5;
  if (e.key === "s") me.y += 5;
  if (e.key === "a") me.x -= 5;
  if (e.key === "d") me.x += 5;

  ws.send(JSON.stringify({
    type: "move",
    pos: me
  }));
});

function draw() {
  ctx.clearRect(0,0,800,500);

  for (let p in players) {
    ctx.fillStyle = (p === id) ? "lime" : "cyan";
    ctx.fillRect(players[p].x, players[p].y, 20, 20);
  }

  requestAnimationFrame(draw);
}

draw();
</script>

</body>
</html>
  `);
});

server.listen(process.env.PORT || 3000);
