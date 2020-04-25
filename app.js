const { Player } = require('./player/player.js');
const { Lightning } = require('./skills/lightning.js');
const { Napalm } = require('./skills/napalm.js');
const express = require('express');

// create an instance of an express app
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

const players = {};
let playerCounter = 0;

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);
  // create a new player and add it to our players object
  playerCounter++;
  // players[socket.id] = {
  //   name: 'player ' + playerCounter,
  //   flipX: false,
  //   x: Math.floor(Math.random() * 400) + 50,
  //   y: Math.floor(Math.random() * 500) + 50,
  //   playerId: socket.id,
  //   level: 1,
  //   HP: 90,
  //   maxHP: 90,
  //   skills: [
  //     //{ key: 'lightning', radius: 150, damage: 10 }
  //     new Lightning('lightning', 200, 50, 10, (skill) => io.emit('skillUpdate', { index: 0, skill })),
  //     new Napalm('napalm', 150, 75, 15, (skill) => io.emit('skillUpdate', { index: 1, skill }))
  //   ]
  // };
  const player = new Player('player ' + playerCounter, socket.id);
  player.updateCallback = (player) => socket.emit('playerUpdate', player);
  player.onLevelUp = () => {
    io.emit('updatePlayers', players);
    io.emit('playerLevelUp', { id: player.playerId, hp: player.HP, maxHP: player.maxHP });
  }
  player.skills = [
    //{ key: 'lightning', radius: 150, damage: 10 }
    new Lightning('lightning', 200, 50, 10, (skill) => { socket.emit('skillUpdate', { index: 0, skill }); player.addExp(); }),
    new Napalm('napalm', 150, 75, 15, (skill) => { socket.emit('skillUpdate', { index: 1, skill }); player.addExp(); })
  ];
  players[socket.id] = player;


  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  io.emit('updatePlayers', players);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
    io.emit('updatePlayers', players);
  });

  // when a plaayer moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].flipX = movementData.flipX;
    players[socket.id].anim = movementData.anim;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('useSkill', ({ x, y, skillIndex }) => {
    //console.log('skill used ', target, distance(players[socket.id].x, players[socket.id].y, players[target].x, players[target].y));
    const skill = players[socket.id].skills[skillIndex];
    const damage = skill.damage;
    //if (distance(players[socket.id].x, players[socket.id].y, x, y) > skill.radius) return;
    if (skill.canUse(players[socket.id].x, players[socket.id].y, x, y)) return;
    // const targetsID = [];
    // const deadPlayersID = [];
    // for (let playerId in players) {
    //   let player = players[playerId];
    //   if (distance(player.x, player.y, x, y) < skill.area) {
    //     targetsID.push(playerId);
    //     player.HP = Math.max(player.HP - skill.damage, 0);
    //     if (player.HP === 0) {
    //       deadPlayersID.push(playerId);
    //     }
    //   }
    // }
    const [targetsID, deadPlayersID] = skill.use(x, y, players);
    io.emit('useSkillComplete', { x, y, owner: socket.id, skillIndex, targets: targetsID, damage });
    deadPlayersID.forEach((playerId) => {
      io.emit('userDead', { playerId });
      setTimeout(() => {
        delete players[playerId];
      }, 1000);
    });
    if (deadPlayersID.length > 0) {
      setTimeout(() => io.emit('updatePlayers', players), 2000);
    }
  });
});

app.use(express.static(__dirname + '/public/'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// catch all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: '404 - Not Found' });
});

// handle errors
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});

const distance = (x1, y1, x2, y2) => {
  var dx = Math.abs(x1 - x2) - 10;
  var dy = Math.abs(y1 - y2) - 11;
  return Math.sqrt(dx * dx + dy * dy);
}