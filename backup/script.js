// Player Factory
const player = (name, symbol) => {
  return { name, symbol };
};

// Game Module
const gameBoard = (() => {
  let gameFinished = false;
  let currentPlayer = "X";

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

  // game board functions
  function checkWin(cells) {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (
        cells[a].textContent === currentPlayer &&
        cells[b].textContent === currentPlayer &&
        cells[c].textContent === currentPlayer
      ) {
        gameFinished = true;
        gameController.resultDisplay.textContent = `${currentPlayer} won!`;
        if (gameController.player1.symbol === currentPlayer) {
          gameController.resultDisplay.textContent = `${gameController.player1.name} won!`;
        } else {
          gameController.resultDisplay.textContent = `${gameController.player2.name} won!`;
        }
        currentPlayer = 'X';
      }
    }
    if (
      !gameFinished &&
      Array.from(cells).every((cell) => cell.textContent !== "")
    ) {
      gameFinished = true;
      gameController.resultDisplay.textContent = "It's a draw!";
      currentPlayer = 'X';
    }
  }

  function handleCellClick(cells, clickedCell) {
    // console.log(gameFinished);
    console.log(currentPlayer);
    if (gameFinished || clickedCell.textContent !== "") return;
    clickedCell.innerHTML = currentPlayer;
    checkWin(cells);
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }

  function setCurrentPlayer(symbol) {
    currentPlayer = symbol;
  }

  function setGameFinished(isGameFinisihed) {
    gameFinished = isGameFinisihed;
  }

  // return
  return {
    setCurrentPlayer,
    setGameFinished,
    handleCellClick,    
  };
})();

const gameController = (() => {
  const cells = document.querySelectorAll("td");
  const resultDisplay = document.querySelector(".result");
  const restart = document.getElementById("restart");
  const start = document.getElementById("start");
  const formContent = document.getElementById("form-content");
  const player1 = player("X", "X");
  const player2 = player("O", "O");

  function setupEventListeners() {
    // adding eventlisteners to start and restart button
    restart.addEventListener("click", () => {
      gameBoard.setGameFinished(false);
      resultDisplay.textContent = "";
      gameBoard.setCurrentPlayer("X");
      cells.forEach((cell) => {
        cell.textContent = "";
      });
    });

    start.addEventListener("click", (e) => {
      e.preventDefault();

      // Creating player objects
      let name1 = formContent.elements["playerX"].value;
      if (name1 !== '') {
        player1.name = name1;
      }
      let name2 = formContent.elements["playerO"].value;
      if (name2 !== '') {
        player2.name = name2;
      }

      // player1.name = formContent.elements["playerX"].value;
      // player2.name = formContent.elements["playerO"].value;

      console.log(JSON.stringify(player1));
      console.log(JSON.stringify(player2));

      // adding eventlisteners to put X or O on board
      cells.forEach((cell) => {
        cell.addEventListener("click", () => {
          gameBoard.handleCellClick(cells, cell);
          console.log("clicked");
        });
      });
    });
  }

  return {
    resultDisplay,
    player1,
    player2,
    init() {
      setupEventListeners();
    },
  };
})();

gameController.init();
