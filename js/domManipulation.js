const placeSymbols = symbols => {
  $(symbols).each(function(index, symbol) {
    if (symbol) {
      $("#square" + index).html(`<div class="${symbol}">&nbsp;</div>`);
    } else {
      $("#square" + index).html("");
    }
  });
};

const isSquareEmpty = id => !$("#" + id).html();

const render = () => {
  const symbols = ticTacToe.getAllTurns();
  placeSymbols(symbols);
};

$(document).ready(function() {
  $(".current-player span").text(
    ticTacToe.playerNames[ticTacToe.currentPlayerId]
  );

  // restart game
  $(".modal-box-button").on("click", function() {
    ticTacToe.turns = [];
    render();
    $(".modal").fadeOut(200);
  });

  // add the players turn indicators (one for each player)
  $(Object.keys(ticTacToe.playerNames)).each(function(index, playerId) {
    $(`.${playerId}`).text(ticTacToe.playerNames[playerId]);
    $(`.${ticTacToe.currentPlayerId}`).addClass("name-active");
  });

  $(".square").on("click", function(event) {
    // get id of square
    const { id } = event.target;

    // get current userId
    const { currentPlayerId } = ticTacToe;

    // check if square is empty first
    if (isSquareEmpty(id)) {
      // change to next player
      ticTacToe.changePlayer();

      $(Object.keys(ticTacToe.playerNames)).each(function(index, player) {
        $(`.${player}`).toggleClass("name-active");
      });

      // save current user's turn
      ticTacToe.addPlayerTurn(currentPlayerId, id);

      // render all o and x
      render();

      if (ticTacToe.checkWinner()) {
        const winner = ticTacToe.checkWinner();
        const message =
          winner === "none" ? "It's a tie" : `The winner is ${winner}`;
        $(".modal-box-message").text(message);
        $(".modal").fadeIn(600);
      }
    }
  });
});
