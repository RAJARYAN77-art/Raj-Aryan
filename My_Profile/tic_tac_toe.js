    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameOver = false;
    let vsComputer = false;

    const cells = document.querySelectorAll('.cell');
    const turnDisplay = document.getElementById('turn');
    const winnerMessage = document.getElementById('winner-message');
    const gameContainer = document.querySelector('.game-container');
    const gameInfo = document.querySelector('.game-info');

    function startGame(mode) {
      vsComputer = (mode === 'computer');
      document.querySelector('.mode-selection').style.display = 'none';
      gameContainer.style.display = 'flex';
      gameInfo.style.display = 'block';
      resetGame();
    }

    function handleCellClick(index) {
      if (gameOver || gameBoard[index] !== '') return;

      gameBoard[index] = currentPlayer;
      document.getElementById(`cell-${index}`).innerText = currentPlayer;

      if (checkWin()) {
        gameOver = true;
        showWinnerMessage();
        return;
      }

      if (checkTie()) {
        gameOver = true;
        showTieMessage();
        return;
      }

      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      turnDisplay.innerText = `Player ${currentPlayer}'s turn`;

      if (vsComputer && currentPlayer === 'O' && !gameOver) {
        setTimeout(computerMove, 500);
      }
    }

    function computerMove() {
      const emptyCells = gameBoard.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      if (emptyCells.length === 0) return;
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      handleCellClick(randomIndex);
    }

    function checkWin() {
      const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      return winConditions.some(([a, b, c]) =>
        gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]
      );
    }

    function checkTie() {
      return gameBoard.every(cell => cell !== '');
    }

    function showWinnerMessage() {
      winnerMessage.style.display = 'block';
      winnerMessage.innerText = `PLAYER ${currentPlayer} WINS!`;
      turnDisplay.style.display = 'none';
      alert(winnerMessage.innerText = `PLAYER ${currentPlayer} WINS!`)
    }
    

    function showTieMessage() {
      winnerMessage.style.display = 'block';
      winnerMessage.innerText = "IT'S A TIE!";
      turnDisplay.style.display = 'none';
      alert("IT'S A TIE!")
    }

    function resetGame() {
      currentPlayer = 'X';
      gameBoard = ['', '', '', '', '', '', '', '', ''];
      gameOver = false;
      turnDisplay.innerText = `Player ${currentPlayer}'s turn`;
      turnDisplay.style.display = 'block';
      winnerMessage.style.display = 'none';
      cells.forEach(cell => cell.innerText = '');
      
    }
    function newGame() {
      document.querySelector('.mode-selection').style.display = 'block';
      gameContainer.style.display = 'none';
      gameInfo.style.display = 'none';
      winnerMessage.style.display = 'none';
      resetGame();
    }

    cells.forEach((cell, i) => cell.addEventListener('click', () => handleCellClick(i)));
    document.getElementById('reset-button').addEventListener('click', resetGame);
    document.getElementById('new-button').addEventListener('click', newGame);
    document.getElementById('computer-mode').addEventListener('click', () => startGame('computer'));
    document.getElementById('pvp-mode').addEventListener('click', () => startGame('pvp'));