// Player Factory
const player = (name, symbol, imgSource) => {
  const img = document.createElement("img");
  img.src = imgSource;
  img.alt = symbol;
  return { name, symbol, imgSource, img };
};

// Game Module
const gameBoard = (() => {
  let gameFinished = false;
  let currentPlayer;
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

  // check win
  function checkWin(cells) {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      let aCell = cells[a].querySelector('img');
      let bCell = cells[b].querySelector('img');
      let cCell = cells[c].querySelector('img');
      if (
        aCell && bCell && cCell &&
        aCell.alt === currentPlayer.symbol &&
        bCell.alt === currentPlayer.symbol &&
        cCell.alt === currentPlayer.symbol
      ) {
        gameFinished = true;
        gameController.resultDisplay.textContent = `${currentPlayer.name} won!`;
        if (gameController.playerX.symbol === currentPlayer.symbol) {
          gameController.resultDisplay.textContent = `${gameController.playerX.name} won!`;
          gameController.overlay.display = "block";
        } else {
          gameController.resultDisplay.textContent = `${gameController.playerO.name} won!`;
        }
        currentPlayer = gameController.playerX;
      }
    }
    if ( !gameFinished && 
      Array.from(cells).every((cell) => cell.hasChildNodes())
      ) {
        gameFinished = true;
        gameController.resultDisplay.textContent = "It's a Draw!";
        currentPlayer = gameController.playerX;
      }
  }

  // handling clicks on each cell
  function handleCellClick(cells, clickedCell) {
    console.log(currentPlayer);
    if (gameFinished || clickedCell.hasChildNodes()) return;
    clickedCell.innerHTML = currentPlayer.img.outerHTML;
    checkWin(cells);

    // if (!gameFinished) {
    //   if (gameController.vsBot && currentPlayer === gameController.playerX) {
    //     bot.makeMove(cells);
    //     checkWin(cells);
    //   } else {
    //     currentPlayer = currentPlayer.symbol === "X" ? gameController.playerO : gameController.playerX;
    //   }
    // }
    currentPlayer = currentPlayer.symbol === "X" ? gameController.playerO : gameController.playerX;
  }

  function setCurrentPlayer(player) {
    currentPlayer = player;
  }

  function setGameFinished(isGameFinished) {
    gameFinished = isGameFinished;
  }

  return {
    setCurrentPlayer,
    setGameFinished,
    handleCellClick,
  };
})();

// Utility module
const utils = (() => {
  function getPlayerName(player, element) {
    let timeoutId;
    element.addEventListener("input", (event) => {
      event.preventDefault();
      // this is to clear out all previous timeout before starting another
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        player.name = event.target.value;
        console.log(`Player name set to ${player.name}`);
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

  // variables
  let vsBot = false;

  // creating player objects
  let playerX = player("X", "X", "./img/X-Stroke.png");
  let playerO = player("O", "O", "./img/O-Stroke.png");
  let bot = player("bot", "O", "./img/O-Stroke.png");

  // attach eventlisteners to elements
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
      gameBoard.setCurrentPlayer(playerX);
      // adding eventlisteners to each cell in board
      cells.forEach((cell) => {
        cell.addEventListener("click", () => {
          gameBoard.handleCellClick(cells, cell);
        });
      });
    });
  }

  return {
    resultDisplay,
    playerX,
    playerO,
    bot,
    vsBot,
    overlay,
    init() {
      setUpEventListeners();
    },
  };
})();

gameController.init();
