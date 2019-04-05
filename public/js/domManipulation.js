/////////////////////////
// HELPER FUNCTIONS
/////////////////////////

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

const getGameId = () => {
  const url = window.location.href;
  return url.slice(url.indexOf("#") + 1, url.length);
};

const isCurrentPlayer = () => {
  const gameId = getGameId();
  return sessionStorage.getItem(gameId) === ticTacToe.currentPlayerId;
};

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

  // display winner/tie message at game end
  displayResult();
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

/////////////////////////
// MAIN FUNCTION
/////////////////////////

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

  // add the 'which player's turn is it display' (one for each player)
  $(Object.keys(ticTacToe.playerNames)).each(function(index, playerId) {
    $(`.${ticTacToe.currentPlayerId}`).addClass("name-active");
  });

  $(".square").on("click", function(event) {
    // get id of square
    const { id } = event.target;

    // get current playerId // CHANGE TO FIREBASE
    const { currentPlayerId } = ticTacToe;

    // check if square is empty first and it's currently this player's turn
    if (isSquareEmpty(id) && isCurrentPlayer()) {
      // change to next player
      ticTacToe.changePlayer(getGameId());

      // save current user's turn
      if (!$(".highlight-square").length)
        ticTacToe.addPlayerTurn(getGameId(), currentPlayerId, id);

      // render all o and x
      render();
    }
  });

  /////////////////////////
  // CHEATS
  /////////////////////////

  const cheatList = `<h3>Cheat Menu</h3>
                  <h4>Blatant Cheats</h4>
                    <input type="checkbox" class="square-jump" id="squareJump"></input><label for="squareJump">Jump opponent's square as they take their turn</label><br /><br />
                    <input type="checkbox" class="delete-turn" id="deleteTurn"></input><label for="deleteTurn">Delete an opponent's turn</label><br /><br />
                    <input type="checkbox" class="move-turn" id="moveTurn"></input><label for="moveTurn">Move an opponent's turn to another square</label><br /><br />
                  <h4>Sleight of Hand</h4>
                    <input type="checkbox" class="magic-loading" id="magicLoading"></input><label for="magicLoading">Distracts an opponent with a "loading" box while you adjust their turn</label><br /><br />
                    <input type="checkbox" class="magic-ad" id="magicAd"></input><label for="magicAd">Distracts an opponent with a fake ad while you adjust their turn</label><br /><br />`;

  // append angel and devil
  $(".game").append(
    `<div class='top-right'><img class='image-devil' src ='images/flanders.png'/></div>
    <div class='top-left'><img class='image-angel' src ='images/lisa.png'/></div>`
  );

  // append cheat list
  $(".image-devil").on("click", function() {
    $(".mod-list").hover(function() {
      $(this).css("opacity", "");
    });
  });

  if (!$(".mod-list").length) {
    $(".game").append("<div class='mod-list'></div>");
    $(".mod-list").append(cheatList);
    $(".mod-list").hover(function() {
      $(this).css("opacity", 0);
    });
  }

  // remove cheat list
  $(".image-angel").on("click", function() {
    if ($(".mod-list").length) {
      $(".mod-list").remove();
    }
  });

  // listen for changes to checkboxes in firebase
  const onCheckboxChange = () => {
    // on change set the changed checkbox to checked
    firebase
      .database()
      .ref(`games/${getGameId()}/checkboxes`)
      .on("value", function(snapshot) {
        if (snapshot.val()) {
          //if (sessionStorage.getItem(getGameId()) === "player1") return;
          const checkboxClass = Object.keys(snapshot.val())[0];
          $(`.${checkboxClass}`).trigger("click");
        }
      });
  };

  // set all checkboxes as false in firebase on devil click
  firebase
    .database()
    .ref(`games/${getGameId()}/checkboxes`)
    .set({
      "square-jump": false,
      "delete-turn": false,
      "move-turn": false,
      "magic-loading": false,
      "magic-ad": false
    })
    .then(onCheckboxChange);

  // set checked on opponent's checkboxes
  const checkOpponentCheckbox = checkboxClass => {
    // on click of checkboxes set that checkbox in firebase to true
    const isChecked = $(`.${checkboxClass}`)[0].checked;
    firebase
      .database()
      .ref(`games/${getGameId()}/checkboxes`)
      .set({ [checkboxClass]: isChecked });
  };

  // SQUARE JUMP

  // set handler for square jump checkbox change
  $(".game").on("change", ".mod-list > .square-jump", function(event) {
    checkOpponentCheckbox("square-jump");
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

  // set handler for move turn checkbox change
  $(".game").on("change", ".mod-list > .move-turn", function() {
    checkOpponentCheckbox("move-turn");
    const self = this;
    $(".square").on("mousedown", function() {
      const squareId = this.id;
      const { currentPlayerId } = ticTacToe;
      const includesNought = $(this)
        .html()
        .includes("nought");

      if (includesNought && currentPlayerId === "player1") {
        const selectOpponentTurn = function() {
          const selectedSquareId = this.id;
          $(this).toggleClass("highlight-square");
          render();
          $(".square").off("click", selectOpponentTurn);
          const moveOpponentTurn = function() {
            if (selectedSquareId !== this.id) {
              $("#" + selectedSquareId).toggleClass("highlight-square");
              ticTacToe.removePlayerTurn(
                getGameId(),
                "player2",
                selectedSquareId
              );
              ticTacToe.addPlayerTurn(getGameId(), "player2", this.id);
              render();
              ticTacToe.currentPlayerId = "player1";
              ticTacToe.firebase.setCurrentPlayerId(getGameId(), "player1");
            }
            $(".square").off("click", moveOpponentTurn);
          };
          $(".square").on("click", moveOpponentTurn);
        };

        $(".square").on("click", selectOpponentTurn);
      }
    });
  });

  // DELETE TURN

  // set handler for move turn checkbox change
  $(".game").on("change", ".mod-list > .delete-turn", function() {
    checkOpponentCheckbox("delete-turn");
    // const self = this;
    // if (self.checked) {
    //   $(".square").on("mousedown", function() {
    //     const squareId = this.id;
    //     const { currentPlayerId } = ticTacToe;
    //     const includesNought = $(this)
    //       .html()
    //       .includes("nought");
    //
    //     if (includesNought && currentPlayerId === "player1") {
    //       $(this).toggleClass("highlight-square");
    //       const deleteTurn = function() {
    //         ticTacToe.removePlayerTurn("player2", this.id);
    //         $(this).toggleClass("highlight-square");
    //         render();
    //         $(".square").off("click", deleteTurn);
    //       };
    //       $(".square").on("click", deleteTurn);
    //     }
    //   });
    // }
  });

  // SLEIGHT OF HAND - MAGIC

  // MAGIC LOADING

  $(".game").on("change", ".mod-list > .magic-loading", function() {
    checkOpponentCheckbox("magic-loading");
    const { checked } = this;
    ticTacToe.firebase.onTurnsChange(getGameId(), function(snapshot) {
      if (
        //checked &&
        //ticTacToe.currentPlayerId === "player2" &&
        sessionStorage.getItem(getGameId()) === "player2" //&&
        //$(".highlight-square").length
      ) {
        $(".modal")
          .show()
          .delay(800)
          .fadeOut(200);
        $(".modal-box-button").hide();
        $(".modal-box-message").text("Loading...");
        setTimeout(function() {
          $(".modal-box-button").show();
        }, 800);
      }
    });
    $(".square").on("click", function() {
      // if (
      //   checked &&
      //   !ticTacToe.checkWinner() &&
      //    &&
      //   $(".highlight-square").length
      // ) {
      //   $(".modal")
      //     .show()
      //     .delay(800)
      //     .fadeOut(200);
      //   $(".modal-box-button").hide();
      //   $(".modal-box-message").text("Loading...");
      //   setTimeout(function() {
      //     $(".modal-box-button").show();
      //   }, 800);
      // }
    });
  });

  // MAGIC AD

  $(".game").on("change", ".mod-list > .magic-ad", function() {
    checkOpponentCheckbox("magic-ad");
    const { checked } = this;
    $(".square").on("click", function() {
      if (
        checked &&
        !ticTacToe.checkWinner() &&
        ticTacToe.currentPlayerId === "player2" &&
        $(".highlight-square").length
      ) {
        $(".modal").show();
        $(".modal-box").hide();
        $(".modal-bg").append(`<div class="modal-box-ad">&nbsp;</div>`);
        $(".modal-box-ad").on("click", function() {
          $(".modal").fadeOut(200);
          $(".modal-box")
            .delay(200)
            .show(200);
          $(".modal-box-ad")
            .delay(200)
            .remove();
        });
      }
    });
  });

  //////////////////////////
  // FIREBASE FEATURES
  //////////////////////////

  const url = window.location.href;
  let gameId, gameUrl, userId;

  const isPlayer1 = sessionStorage.getItem(getGameId()) === "player1";

  if (!url.includes("#") || isPlayer1) {
    // get uid for game: gameId = uid
    gameId = ticTacToe.firebase.createId();

    // save uid to firebase as games: { gameId: {} }
    ticTacToe.firebase.createGame(gameId);

    // add uid to url as # string ...url#gameId
    const cleanUrl = url.slice(0, url.indexOf("#"));
    gameUrl = `${cleanUrl}#${gameId}`;
    window.location.href = gameUrl;

    // set playerId to player1 as they are the game instigators
    playerId = "player1";

    // have user send this link to their opponent
    $(".modal").show();
    $(".modal-box-button").hide();
    $(".modal-box-button-next").show();
    $(".modal-box-message").text(`Send this link to a friend:`);
    $(".modal-box-share-link")
      .show()
      .text(`${gameUrl}`);
  } else {
    playerId = "player2";
    gameId = url.slice(url.indexOf("#") + 1, url.length);
    // let "player2" choose their name
    $(".modal").show();
    $(".modal-box-button").hide();
    $(".modal-box-message").text(`Enter your name:`);
    $(".modal-box-button-start").show();
    $(".modal-enter-name")
      .show()
      .val("Player 2")
      .focus()
      .select();
    $(".modal-box-button-next").hide();
  }

  // listen for changes to currentPlayerId in Firebase
  ticTacToe.firebase.onCurrentPlayerIdChange(gameId);

  // listen for changes to turns
  const callBack = function(snapshot) {
    if (!snapshot.val()) return;
    ticTacToe.turns = [...snapshot.val()];
    render();
    $(Object.keys(ticTacToe.playerNames)).each(function(index, player) {
      if (!$(".highlight-square").length)
        $(`.${player}`).toggleClass("name-active");
    });
  };
  ticTacToe.firebase.onTurnsChange(gameId, callBack);

  // get newUid for user: userId = newUid
  userId = ticTacToe.firebase.createId();

  // set user as "player1" in firebase: games: { uid: { players: { player1: newUid, player2: "" } } }
  ticTacToe.firebase.setPlayerIds(gameId, playerId, userId);

  $(".modal-box-button-next").on("click", function() {
    $(".modal-box-content").animate(
      { left: "-=300", opacity: 0 },
      350,
      function() {
        $(this).css({ left: "330px" });
        $(".modal-box-share-link").hide();
        $(".modal-box-message").text(`Enter your name:`);
        $(".modal-box-button-start").show();
        $(".modal-enter-name")
          .show()
          .val("Player 1")
          .focus()
          .select();
        $(".modal-box-button-next").hide();
        $(this).animate({ left: "50%", opacity: 1 });
      }
    );
  });

  const startGame = function(event) {
    if (event.which === 13 || event.which === 1) {
      const playerName = $(".modal-enter-name").val();
      ticTacToe.playerNames[playerId] = playerName;
      ticTacToe.firebase.setPlayerName(gameId, playerName, playerId);

      // listen for changes to the player names in firebase
      const callBack = function(snapshot) {
        // set display for each
        const names = snapshot.val();
        const playerIds = Object.keys(names);
        const playerNames = Object.values(names);
        $(playerIds).each(function(index, playerId) {
          $(`.${playerId}`).text(playerNames[index]);
          ticTacToe.playerNames[playerId] = playerNames[index];
        });
      };
      ticTacToe.firebase.onNameChange(gameId, callBack);

      $(".modal-box-button")
        .delay(500)
        .fadeIn();
      $(".modal-box-button-start")
        .delay(500)
        .fadeOut();
      $(".modal-enter-name")
        .delay(500)
        .fadeOut();
      $(".modal").fadeOut(200);
      $(document).off("keypress", startGame);
    }
  };

  $(".modal-box-button-start").on("click", startGame);
  $(document).on("keypress", startGame);

  // save player's playerId to local storage as: gameId: userId
  sessionStorage.setItem(gameId, playerId);
});
