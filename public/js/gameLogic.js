const ticTacToe = {
  playerNames: {
    player1: "Player 1",
    player2: "Player 2"
  },
  rows: 3,
  columns: 3,
  turns: [],
  currentPlayerId: "player1",

  firebase: {
    createId: function() {
      return firebase
        .database()
        .ref("games")
        .push().key;
    },

    createGame: function(gameId, playerId = "") {
      firebase
        .database()
        .ref(`games/${gameId}`)
        .set(
          {
            player1: playerId,
            player2: ""
          },
          function(error) {
            if (error) {
              console.log(error);
            } else {
              //console.log("game created");
            }
          }
        );
    },

    setPlayerIds: function(gameId, playerId, userId) {
      firebase
        .database()
        .ref(`games/${gameId}/playerIds/${playerId}`)
        .set(userId, function(error) {
          if (error) {
            console.log(error);
          } else {
            //console.log("player ID updated");
          }
        });
    },

    setPlayerName: function(gameId, playerName, playerId) {
      firebase
        .database()
        .ref(`games/${gameId}/playerNames/${playerId}`)
        .set(playerName, function(error) {
          if (error) {
            console.log(error);
          } else {
            //console.log("player name updated");
          }
        });
    },

    setCurrentPlayerId: function(gameId, currentPlayerId) {
      firebase
        .database()
        .ref(`games/${gameId}/currentPlayerId`)
        .set(currentPlayerId, function(error) {
          if (error) {
            console.log(error);
          } else {
            //console.log("set current player id");
          }
        });
    },

    onCurrentPlayerIdChange: function(gameId) {
      firebase
        .database()
        .ref(`games/${gameId}/currentPlayerId`)
        .on("value", function(snapshot) {
          ticTacToe.currentPlayerId = snapshot.val() || "player1";
        });
    },

    onTurnsChange: function(gameId, callBack) {
      firebase
        .database()
        .ref(`games/${gameId}/turns`)
        .on("value", callBack);
    },

    getGameData: function(gameId) {
      return firebase
        .database()
        .ref(`games/${gameId}`)
        .once("value")
        .then(snapshot => {
          console.log(snapshot.val());
        });
    },

    onNameChange: function(gameId, callBack) {
      firebase
        .database()
        .ref(`games/${gameId}/playerNames`)
        .on("value", callBack);
    },

    setPlayerTurns: function(gameId, turns) {
      firebase
        .database()
        .ref(`games/${gameId}/turns`)
        .set(turns, function(error) {
          if (error) {
            console.log(error);
          } else {
            //console.log("added player turn to firebase");
          }
        });
    }
  },

  addPlayerTurn: function(gameId, playerId, squareId) {
    this.turns = [...this.turns, { player: playerId, square: squareId }];
    this.firebase.setPlayerTurns(gameId, this.turns);
  },

  removePlayerTurn: function(gameId, playerId, squareId) {
    this.turns = this.turns.filter(
      turn => turn.square && turn.square !== squareId
    );
    this.firebase.setPlayerTurns(gameId, this.turns);
  },

  changePlayer: function(gameId) {
    const playerIds = Object.keys(this.playerNames);
    const indexOfNextPlayer = playerIds.indexOf(this.currentPlayerId) + 1;
    const nextPlayer = playerIds[indexOfNextPlayer];
    this.firebase.setCurrentPlayerId(gameId, nextPlayer || playerIds[0]);
  },

  getAllTurns: function(extraTurns = { playerIds: [], squareIds: [] }) {
    const totalSquares = this.rows * this.columns;
    const squares = Array.from({ length: totalSquares }).map(value => "");

    const playerIds = [
      ...this.turns.map(turn => turn.player),
      ...extraTurns.playerIds
    ];
    const squareIds = [
      ...this.turns.map(turn => turn.square),
      ...extraTurns.squareIds
    ];
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

  checkWinner: function(extraTurns = { playerIds: [], squareIds: [] }) {
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

    const mapAllRows = indexesToCheck.map(row =>
      row.map((square, index) => this.getAllTurns(extraTurns)[row[index]])
    );

    const isEqual = allSymbols =>
      allSymbols.every((symbol, index, array) => symbol === array[0]);
    const winningLines = mapAllRows.filter(row => isEqual(row));

    const winner = winningLines
      .map(winningLine => {
        if (winningLine[0]) return winningLine[0];
      })
      .filter(each => each !== undefined)[0];

    if (winner)
      return winner === "cross"
        ? this.playerNames.player1
        : this.playerNames.player2;

    const maxTurns = this.rows * this.columns;
    if (this.turns.length === maxTurns) return "none";
  }
};
