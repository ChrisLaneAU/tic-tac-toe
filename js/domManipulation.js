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

const getGridElementsPosition = index => {
  const colCount = $(".game-grid")
    .css("grid-template-columns")
    .split(" ").length;

  const rowPosition = Math.floor(index / colCount);
  const colPosition = index % colCount;

  return { row: rowPosition, column: colPosition };
};

const render = () => {
  const symbols = ticTacToe.getAllTurns();
  placeSymbols(symbols);
};

const displayResult = () => {
  const winner = ticTacToe.checkWinner();
  if (winner) {
    const message =
      winner === "none" ? "It's a tie" : `The winner is ${winner}`;
    $(".modal-box-message").text(message);
    $(".modal").fadeIn(600);
  }
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

  // add the 'which players turn is it display' (one for each player)
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
        if (!$(".highlight-square").length)
          $(`.${player}`).toggleClass("name-active");
      });

      // save current user's turn
      if (!$(".highlight-square").length)
        ticTacToe.addPlayerTurn(currentPlayerId, id);

      // render all o and x
      render();

      // display winner/tie message at game end
      displayResult();
    }
  });

  ////////////////////////////////////////////////////////////////////////

  const modList = `<input type="checkbox" class="square-jump" id="squareJump"></input><label for="squareJump">Jump opponent's square as they take their turn</label>
                  <input type="checkbox" class="delete-turn" id="deleteTurn"></input><label for="deleteTurn">Delete an opponent's turn</label>
                  <input type="checkbox" class="move-turn" id="moveTurn"></input><label for="moveTurn">Move an opponent's turn to another square</label>`;

  // append angel and devil
  $(".game").append(
    `<div class='top-right'><img class='image-devil' src ='images/flanders.png'/></div>
    <div class='top-left'><img class='image-angel' src ='images/lisa.png'/></div>`
  );

  // append mod list
  //$(".image-devil").on("click", function() {
  if (!$(".mod-list").length) {
    $(".game").append("<div class='mod-list'></div>");
    $(".mod-list").append(modList);
  }
  //});

  // SQUARE JUMP

  // set handler for square jump checkbox change
  $(".game").on("change", ".mod-list > .square-jump", function() {
    const self = this;
    $(".square").on("mouseenter", function() {
      const { id } = this;
      if (self.checked) {
        if (ticTacToe.currentPlayerId === "player2") {
          const extraTurn = {
            playerIds: [ticTacToe.currentPlayerId],
            squareIds: [id]
          };
          const isWinner =
            ticTacToe.checkWinner(extraTurn) === ticTacToe.playerNames.player2;
          if (isWinner && isSquareEmpty(id)) {
            const cellPosition = getGridElementsPosition(
              id.slice(id.length - 1)
            );
            if (cellPosition.column === 2) {
              $("#" + id).toggleClass("move-square-right-2");
            } else if (cellPosition.column === 1) {
              $("#" + id).toggleClass("move-square-left-3");
            } else {
              $("#" + id).toggleClass("move-square-left-2");
            }
          }
        }
      }
    });
  });

  // clean up jumped square
  $(".square").on("click", function() {
    $(".square").each(function(index, square) {
      $(square).removeClass(
        "move-square-right-2 move-square-left-2 move-square-left-3"
      );
    });
  });

  // MOVE TURN
  //// TODO: not delete but move on subsequent click

  // set handler for move turn checkbox change
  $(".game").on("change", ".mod-list > .move-turn", function() {
    const self = this;
    $(".square").on("mousedown", function() {
      const squareId = this.id;
      const { currentPlayerId } = ticTacToe;
      const includesNought = $(this)
        .html()
        .includes("nought");

      if (includesNought && currentPlayerId === "player1") {
        const selectOponentTurn = function() {
          const selectedSquareId = this.id;
          $(this).toggleClass("highlight-square");
          render();
          $(".square").off("click", selectOponentTurn);
          const moveOponentTurn = function() {
            if (selectedSquareId !== this.id) {
              $("#" + selectedSquareId).toggleClass("highlight-square");
              ticTacToe.removePlayerTurn("player2", selectedSquareId);
              ticTacToe.addPlayerTurn("player2", this.id);
              render();
              ticTacToe.currentPlayerId = "player1";
            }
            $(".square").off("click", moveOponentTurn);
          };
          $(".square").on("click", moveOponentTurn);
        };

        $(".square").on("click", selectOponentTurn);
      }
    });
  });

  // DELETE TURN

  // set handler for move turn checkbox change
  $(".game").on("change", ".mod-list > .delete-turn", function() {
    const self = this;
    $(".square").on("mousedown", function() {
      const squareId = this.id;
      const { currentPlayerId } = ticTacToe;
      const includesNought = $(this)
        .html()
        .includes("nought");

      if (includesNought && currentPlayerId === "player1") {
        $(this).toggleClass("highlight-square");
        const deleteTurn = function() {
          ticTacToe.removePlayerTurn("player2", this.id);
          $(this).toggleClass("highlight-square");
          render();
          $(".square").off("click", deleteTurn);
        };
        $(".square").on("click", deleteTurn);
      }
    });
  });
});
