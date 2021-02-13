const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use("/static", express.static(__dirname + "/static"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//structure rooms {roomcode: {playerClientInfo: [name], playerServerInfo: [{name, role, host}], crewmateNames: [name]}}
let rooms = {};

io.on("connection", (socket) => {
  socket.on("enter-info", (data) => {
    //get the users data
    // console.log("User joining: ");
    // console.log(data);
    // console.log("\n");

    if (rooms[data.roomcode] != undefined) {
      //room exists, add player
      rooms[data.roomcode].playerClientInfo.push({
        name: data.username,
        host: false,
      });
      rooms[data.roomcode].playerServerInfo.push({
        name: data.username,
        role: data.role,
        host: false,
      });
      if (data.role == "crewmate") {
        rooms[data.roomcode].crewmateNames.push(data.username);
      }
      io.sockets.emit("new-player", rooms[data.roomcode].playerClientInfo);
    } else {
      socket.emit("you-are-host", true);

      //first player in new room
      rooms[data.roomcode] = {
        playerClientInfo: [],
        playerServerInfo: [],
        crewmateNames: [],
      };
      rooms[data.roomcode].playerClientInfo.push({
        name: data.username,
        host: true,
      });
      rooms[data.roomcode].playerServerInfo.push({
        name: data.username,
        role: data.role,
        host: true,
      });
      if (data.role == "crewmate") {
        rooms[data.roomcode].crewmateNames.push(data.username);
      }

      //   console.log("\nNew Arrays");
      //   console.log("Player Names: " + rooms[data.roomcode].playerClientInfo);
      //   console.log("Player Info: ");
      //   console.log(rooms[data.roomcode].playerServerInfo);
      //   console.log("Crewmate Names: " + rooms[data.roomcode].crewmateNames);
      //   console.log("End New Arrays\n");

      io.sockets.emit("new-player", rooms[data.roomcode].playerClientInfo);
      // console.log("Rooms: ");
      // console.log(rooms);
    }
  });

  socket.on("game-ready", (data) => {
    // console.log("Starting game with players: ");
    // console.log(rooms[data.roomcode]);
    //select jester
    let jesterName =
      rooms[data.roomcode].crewmateNames[
        Math.floor(Math.random() * rooms[data.roomcode].crewmateNames.length)
      ];
    console.log("Jester is: ", jesterName);

    //tell people
    for (var i = 0; i < rooms[data.roomcode].playerServerInfo.length; i++) {
      if (jesterName == rooms[data.roomcode].playerServerInfo[i].name) {
        rooms[data.roomcode].playerServerInfo[i].role = "jester";
      }
    }

    console.log(rooms[data.roomcode].playerServerInfo);
    io.sockets.emit("game-started", rooms[data.roomcode].playerServerInfo);

    //destroy room
    rooms[data.roomcode] = undefined;
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});
