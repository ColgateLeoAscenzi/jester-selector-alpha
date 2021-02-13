var socket = io();

var players = [];
var iAmHost = false;
var myRole = undefined;
var myRoom = undefined;
var myName = undefined;

const submitInfo = (playerInfo) => {
  socket.emit("enter-info", playerInfo);
  myRole = playerInfo.role;
  myRoom = playerInfo.roomcode;
  myName = playerInfo.username;

  //remove form, add new list
  transitionGame();
};

socket.on("new-player", (serverList) => {
  players = serverList;
  console.log(players);

  //refresh ul and li's
  updatePlayerList(players);
});

socket.on("you-are-host", (amHost) => {
  iAmHost = amHost;
  console.log("I am host");
  const readyWrapper = document.createElement("div");
  readyWrapper.innerHTML = "<button onclick = 'playersReady()'>Ready</button>";
  infoContainer.appendChild(readyWrapper);
});

socket.on("game-started", (role) => {
  console.log("I am", role);
  myRole = role;
  const gameContainer = document.getElementById("gameContainer");
  const infoContainer = document.getElementById("infoContainer");
  gameContainer.removeChild(infoContainer);

  finalContainer = document.createElement("div");
  finalContainer.innerHTML =
    "<h1>" +
    myName +
    ", You are a " +
    myRole +
    ", please refresh this page after the game is done</h1>";
  gameContainer.appendChild(finalContainer);
});

//extra functions
const playersReady = () => {
  socket.emit("game-ready", { name: myName, roomcode: myRoom });
};

//DOM helpers
const transitionGame = () => {
  const gameContainer = document.getElementById("gameContainer");
  const submitForm = document.getElementById("submitForm");
  gameContainer.removeChild(submitForm);

  let infoContainer = document.createElement("div");
  infoContainer.innerHTML =
    "<div id = 'infoContainer'><h1 id = 'titlebar'>Waiting on Host: </h1></br><div id = 'playerList'>Empty</div></div>";
  gameContainer.appendChild(infoContainer);
};

const updatePlayerList = (playerL) => {
  if (iAmHost) {
    const titleBar = document.getElementById("titlebar");
    titleBar.innerHTML =
      "You are the host, press ready when all players are in: ";
  }

  const playerListElem = document.getElementById("playerList");
  let compositeString = "<ul>";
  for (var i = 0; i < playerL.length; i++) {
    compositeString += "<li>" + playerL[i].name + "</li>";
  }
  playerListElem.innerHTML = compositeString + "</ul>";
};
