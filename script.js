// Player Factory
const player = (name, symbol, imgSource) => {
  const img = document.createElement("img");
  img.src = imgSource;
  img.alt = symbol;
  return { name, symbol, imgSource, img };
};

// Game Module
const gameBoard = (() => {
  let currentPlayer;
  let gameFinished;
  let origBoard;
  // let origBoard = Array.from(Array(9).keys());
  const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function setCurrentPlayer(player) {
    currentPlayer = player;
  }

  function setOrigBoard(board) {
    origBoard = board;
  }

  function setGameFinished(value) {
    gameFinished = value;
  }

  function turnClick(square) {
    if (typeof origBoard[square.target.id] === "number" && !gameFinished && !checkTie()) {
      // switching between AI and players
      if (gameController.getVsBot()) {
        turn(square.target.id, gameController.playerX);
        if (!checkTie()) turn(bestSpot(), gameController.bot);
      } else {
        turn(square.target.id, currentPlayer);
        currentPlayer =
          currentPlayer.symbol === "X"
            ? gameController.playerO
            : gameController.playerX;
      }
    }
  }

  function turn(squareId, player) {
    origBoard[squareId] = player.symbol;
    document.getElementById(squareId).innerHTML = player.img.outerHTML;

    // checking for wins
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
  }

  function checkWin(board, player) {
    let plays = board.reduce(
      (a, e, i) => (e === player.symbol ? a.concat(i) : a),
      []
    );

    let gameWon = null;
    for (let [index, win] of WINNING_COMBINATIONS.entries()) {
      if (win.every((elem) => plays.indexOf(elem) > -1)) {
        gameWon = { index, player: player };
        break;
      }
    }
    return gameWon;
  }

  function gameOver(gameWon) {
    gameFinished = true;
    for (let index of WINNING_COMBINATIONS[gameWon.index]) {
      document.getElementById(index).style.backgroundColor =
        gameWon.player.symbol === "X" ? "blue" : "red";
    }

    if (gameController.getVsBot()) {
      declareWinner(gameWon.player.symbol === "X" ? "You Win!" : "You Lose");
    } else {
      declareWinner(
        gameWon.player.symbol === "X"
          ? `${gameController.playerX.name} wins!`
          : `${gameController.playerO.name} wins!`
      );
    }
  }

  function declareWinner(who) {
    overlay.style.display = "block";
    document.getElementById("result-display").innerHTML = who;
  }

  function emptySquares() {
    return origBoard.filter((s) => typeof s === "number");
  }

  function bestSpot() {
    return minimax(origBoard, gameController.bot).index;
  }

  function checkTie() {
    if (emptySquares().length === 0) {
      for (let i = 0; i < gameController.cells.length; i++) {
        gameController.cells[i].style.backgroundColor = "green";
        gameController.cells[i].removeEventListener("click", turnClick, false);
      }
      gameFinished = true;
      declareWinner("It's a Tie");
      return true;
    }
    return false;
  }

  function minimax(newBoard, player) {
    let availSpots = emptySquares(newBoard);

    if (checkWin(newBoard, player)) {
      return { score: -10 };
    } else if (checkWin(newBoard, gameController.bot)) {
      return { score: 20 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      let move = [];
      move.index = newBoard[availSpots[i]];
      newBoard[availSpots[i]] = player.symbol;

      if (player.symbol === gameController.bot.symbol) {
        let result = minimax(newBoard, gameController.playerX);
        move.score = result.score;
      } else {
        let result = minimax(newBoard, gameController.bot);
        move.score = result.score;
      }

      newBoard[availSpots[i]] = move.index;

      moves.push(move);
    }

    let bestMove;
    if (player.symbol === gameController.bot.symbol) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }

  return {
    origBoard,
    setCurrentPlayer,
    turnClick,
    setOrigBoard,
    setGameFinished
  };
})();

// Utility Module
const utils = (() => {
  function getPlayerName(player, element) {
    let timeoutId;
    element.addEventListener("input", (event) => {
      event.preventDefault();
      // this is to clear out all previous timeout before starting another
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        player.name = event.target.value;
      }, 500); // delay of 500ms
    });
  }

  return { getPlayerName };
})();

// Game Controller
const gameController = (() => {
  // get all cells in the table
  const cells = document.querySelectorAll("td");
  const resultDisplay = document.querySelector(".result");

  // get start button
  const start = document.getElementById("start");
  const overlay = document.getElementById("overlay");

  // get input elements
  const playerXNameElement = document.getElementById("playerX");
  const playerONameElement = document.getElementById("playerO");
  const botCheck = document.getElementById("check-apple");

  //   creating player objects
  let playerX = player("X", "X", "./img/X-Stroke.png");
  let playerO = player("O", "O", "./img/O-Stroke.png");
  let bot = player("bot", "O", "./img/O-Stroke.png");

  let vsBot = false;

  // return true if playing against bot
  function getVsBot() {
    return vsBot;
  }

  //   attach eventlisteners to elements
  function setUpEventListeners() {
    // check box for bot
    botCheck.addEventListener("change", (event) => {
      event.preventDefault();
      if (event.target.checked) {
        vsBot = true;
      } else {
        vsBot = false;
      }
    });

    // getting player names from input
    utils.getPlayerName(playerX, playerXNameElement);
    utils.getPlayerName(playerO, playerONameElement);

    // adding events to start button
    start.addEventListener("click", (e) => {
      e.preventDefault();

      overlay.style.display = "none";
      start.innerText = "Restart";

      gameBoard.setCurrentPlayer(playerX);
      gameBoard.setOrigBoard(Array.from(Array(9).keys()));
      gameBoard.setGameFinished(false);

      //   gameBoard.origBoard = Array.from(Array(9).keys());
      cells.forEach((cell) => {
        cell.innerHTML = "";
        cell.style.removeProperty("background-color");
        cell.addEventListener("click", (event) => {
          gameBoard.turnClick(event);
        });
      });
    });
  }

  return {
    resultDisplay,
    playerX,
    playerO,
    bot,
    overlay,
    cells,
    getVsBot,
    init() {
      setUpEventListeners();
    },
  };
})();

gameController.init();
