angular.module('ngWindmill',[])
       .controller('ngWindmillCtrl', function($scope) {

  $scope.title = 'Windmill'

  var UTIL = {
    fire : function(func, funcname, args) {

      var namespace = GAME

      funcname = (funcname === undefined) ? 'init' : funcname
      if (func !== '' && namespace[func] && typeof namespace[func][funcname] == 'function') {
        namespace[func][funcname](args)
      }
    },
    loadEvents : function() {
      UTIL.fire('windmill')
      UTIL.fire('windmill', 'run')
    }
  }

  var GAME = $scope.GAME = {
    windmill : {
      init : function() {
        this.player1 = new AI('Daenerys', 1)
        this.player2 = new Human('Jon Snow', 2)
        this.currentPlayer = this.player1
        this.noCatchCountdown = 0 // 50 moves without a catch = tie
        this.threePiecesCountdown = 0 // 10 moves when both players only have 10 pieces remaining = tie
        var boardSize = 24
        this.boardSize = boardSize
        this.board = []
        while(boardSize--) this.board.push(0)
        this.graph = [
                        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
                        [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8], [10, 1], [12, 3],
                        [14, 5], [8, 16], [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22],
                        [22, 23], [18, 10], [20, 12], [22, 14]
                     ]
        this.graphLength = this.graph.length
      },
      run : function() {
        console.log(this.currentPlayer)

        this.checkPieces()

        this.pickPosition()

        console.log(this.board)

        this.changePlayer()

        setTimeout(function(_this) { $scope.$apply(_this.run()) }, 5000, this)
      },
      newGame : function() {
        console.log('New game')
        this.init
        this.run
      },
      pickPosition : function() {
        var position = this.currentPlayer.pickPosition()
        this.setPieceOnPosition(position)
      },
      setPieceOnPosition : function(position) {
        var currentPlayer = this.currentPlayer
        console.log(position);
        var badPosition = !position || this.board[position] !== 0 || position < 0 || position > (this.boardSize - 1)
        if (badPosition) {
          this.pickPosition()
        } else {
          var isPlacingPhase = currentPlayer.phase.value === PHASE.PLACING.value
          var isMovingPhase = currentPlayer.phase.value === PHASE.MOVING.value
          var isFlyingPhase = currentPlayer.phase.value === PHASE.FLYING.value

          if(isPlacingPhase) {
            this.board[position] = currentPlayer.marker
            currentPlayer.stockPieces--

            var playerHasNoPiecesInStock = currentPlayer.stockPieces === 0
            if(playerHasNoPiecesInStock) {
              currentPlayer.phase = PHASE.MOVING
            }
          } else if(isMovingPhase) {
            var playerHasLessThanThreePieces = this.countPiecesOnBoard() <= 3
            if(playerHasLessThanThreePieces) {
              currentPlayer.phase = PHASE.FLYING
            }

            // Implement me (check for a valid movement)
          } else if(isFlyingPhase) {
            // Implement me (check for a valid movement)
          }
        }
      },
      changePlayer : function() {
        if (this.currentPlayer == this.player1)
          this.currentPlayer = this.player2
        else
          this.currentPlayer = this.player1
      },
      countPiecesOnBoard: function() {
        var piecesOnBoard = _.filter(this.board, function(marker) {
          return marker == this.currentPlayer.marker
        }, this).length

        return piecesOnBoard
      },
      checkPieces : function() {
        var piecesOnBoard = this.countPiecesOnBoard()
        if (piecesOnBoard + this.currentPlayer.stockPieces < 3) {
          this.newGame
        }
      }
    }
  }

  /**
   * Differents phases of the game
   * @type {Object}
   */
  var PHASE = {
    PLACING: {value: 0, name:'Placing pieces'},
    MOVING:  {value: 1, name:'Moving pieces'},
    FLYING:  {value: 2, name:'Flying'}
  }

  var Player = Class.extend({
    init: function(type, username, marker) {
      this.type = type
      this.stockPieces = 9
      this.username = username
      this.marker = marker
      this.phase = PHASE.PLACING
    }
  })

  var Human = Player.extend({
    init: function(username, marker) {
      this._super('human', username, marker)
    },
    pickPosition: function() {
      // ----------------------------- TODO: create a graphical interface -----------------------------
      return prompt('Pick a position between 0 and ' + (GAME.windmill.boardSize - 1))
      //-----------------------------------------------------------------------------------------------

    }
  })

  var AI = Player.extend({
    init: function(username, marker) {
      this._super('AI', username, marker)
    },
    pickPosition: function() {
      var position
      var isFirstRound = this.stockPieces == 9
      if (isFirstRound) {
        position = _.random(GAME.windmill.boardSize - 1) // because this is the player's 1st round
      } else {
        switch(this.phase) {
          case PHASE.PLACING:
            position = this.findPlacingPosition()
            break
          case PHASE.MOVING:
            position = this.findMovingPosition()
            break
          case PHASE.FLYING:
            position = this.findFlyingPosition()
            break
          default:
            position = this.findPlacingPosition()
        }
      }
      return position
    },
    findPlacingPosition: function() {
      var positionCurrentPlayer, position
      _.each(GAME.windmill.board, function(marker, index) {
        var markerCurrentPlayer = marker == this.marker
        if (markerCurrentPlayer) {
          // we use the graph to check if there is an empty position directly linked to the piece, if yes we set the next piece on that position
          _.each(GAME.windmill.graph, function(element) {
            if(element[0] == index && GAME.windmill.board[element[1]] === 0)
              position = element[1]
            else if (element[1] == index && GAME.windmill.board[element[0] === 0])
              position = element[0]
          })

          // TODO: position = agressive position, need to check for a defensive position in case the other player is about to win
        }
      }, this)

      if (!position) { // if all pieces are surrounded and no position was found
        position = _.random(GAME.windmill.boardSize - 1)
      }

      return position
    },
    findMovingPosition: function() {
      console.log('Implement me !');
      return _.random(GAME.windmill.boardSize - 1)
    },
    findFlyingPosition: function() {
      console.log('Implement me !');
      return _.random(GAME.windmill.boardSize - 1)
    }
  })

  UTIL.loadEvents()
})

//--------------- GRAPH: DO NOT DELETE THIS SCHEMA ------------
//     0------------1------------2
//     |            |            |
//     |   9-------10------11    |
//     |   |        |       |    |
//     |   |   17--18--19   |    |
//     |   |   |        |   |    |
//     7---8---16      20--12----3
//     |   |   |        |   |    |
//     |   |   23--22--21   |    |
//     |   |        |       |    |
//     |   15------14------13    |
//     |            |            |
//     6------------5------------4