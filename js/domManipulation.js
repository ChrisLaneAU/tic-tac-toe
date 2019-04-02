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

  $(".modal-box-button").on("click", function() {
    ticTacToe.turns = [];
    render();
    $(".modal").fadeOut(200);
  });

  $(".square").on("click", function(event) {
    // get id of square
    const { id } = event.target;

    // get current userId
    const { currentPlayerId } = ticTacToe;

    // check if square is empty first
    if (isSquareEmpty(id)) {
      ticTacToe.changePlayer();
      $(".current-player span").text(
        ticTacToe.playerNames[ticTacToe.currentPlayerId]
      );

      // log current user's turn
      ticTacToe.addPlayerTurn(currentPlayerId, id);

      // manipulate DOM
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
