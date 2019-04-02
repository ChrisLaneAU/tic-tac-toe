const ticTacToe = {
  playerNames: {
    player1: "Player 1",
    player2: "Player 2"
  },
  rows: 3,
  columns: 3,
  turns: [],
  currentPlayerId: "player1",

  addPlayerTurn: function(playerId, squareId) {
    this.turns = [...this.turns, { player: playerId, square: squareId }];
  },

  changePlayer: function() {
    const playerIds = Object.keys(this.playerNames);
    const indexOfNextPlayer = playerIds.indexOf(this.currentPlayerId) + 1;
    const nextPlayer = playerIds[indexOfNextPlayer];
    this.currentPlayerId = nextPlayer || playerIds[0];
  },

  getAllTurns: function() {
    const totalSquares = this.rows * this.columns;
    const squares = Array.from({ length: totalSquares }).map(value => "");

    const playerIds = this.turns.map(turn => turn.player);
    const squareIds = this.turns.map(turn => turn.square);
    const squareIndexes = squareIds.map(squareId =>
      squareId.slice(squareIds[0].length - 1)
    );
    const convertToXAndO = squareIds.map((square, index) => {
      if (playerIds[index] === "player1") return "cross";
      return "nought";
    });

    squareIndexes.forEach((squareIndex, index) => {
      squares[squareIndex] = convertToXAndO[index];
    });

    return squares;
  },

  checkWinner: function() {
    const indexesToCheck = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    const checkAllRows = indexesToCheck.map(row =>
      row.map((square, index) => this.getAllTurns()[row[index]])
    );

    const isEqual = allSymbols =>
      allSymbols.every((symbol, index, array) => symbol === array[0]);
    const result = checkAllRows.filter(row => isEqual(row));

    const winner = result
      .map(winningLine => {
        if (winningLine[0]) return winningLine[0];
      })
      .filter(each => each !== "");

    if (winner.length) return winner[0];

    const maxTurns = this.rows * this.columns;
    if (this.turns.length === maxTurns) return "none";
  }
};
