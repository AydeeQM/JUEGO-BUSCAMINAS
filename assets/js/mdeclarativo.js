'use strict';
const app = {
    setup: {
        board: undefined,
    },
    init: function () {
        $(document).ready(function () {
            app.newGame('medium');
            $('#new-game').hide();

            $('#difficulty li').click(function (eventObject) {
                $('#difficulty li').removeClass('selected');
                $(this).addClass('selected');
                let difficulty = $(this).attr('id');
                app.newGame(difficulty);
                $('#new-game').hide();
            });

            $('#new-game').click(function (eventObject) {
                let difficulty = $('#difficulty li.selected').attr('id');
                app.newGame(difficulty);
                $('#new-game').hide();
            });
        });

        app.newGame();
        app.Board();
        app.Space();

    },
    // Start New Game
    newGame: function (difficulty) {
        switch (difficulty) {
            case 'easy':
                app.setup.board = new app.Board(6, 6);
                break;
            case 'hard':
                app.setup.board = new app.Board(10, 10);
                break;
            case 'medium':
            default:
                app.setup.board = new app.Board(8, 8);
                break;
        }
        app.setup.board.render();
        app.setup.board.gameOver = false;

        $('.space').click(function (eventObject) {
            app.setup.board.click(eventObject.target);
        });

        return app.setup.board;
    },

    // Board Object
    Board: function (row, col) {
        this.row = row;
        this.col = col;
        this.spaces = [];
        this.gameOver = false;
        this.spacesCleared = 0;
        this.bombCount = 0;

        this.click = function (target_elem) {
            let row = $(target_elem).attr("data-row");
            let col = $(target_elem).attr("data-col");


            if (this.gameOver === true) {
                return;
            }

            if (this.spaces[row - 1][col - 1].explored == true) {
                return;
            }

            if (this.spaces[row - 1][col - 1].holds == -1) {
                this.explode();
            } else if (this.spaces[row - 1][col - 1].holds == 0) {
                this.clear(row - 1, col - 1);
                uncoverSurroundings.call(this, row - 1, col - 1);
            } else {
                this.clear(row - 1, col - 1);
            }
        }

        this.render = function () {
            let spaces = "";
            for (let i = 1; i <= row; i++) {
                for (let j = 1; j <= col; j++) {
                    spaces = spaces.concat('<div class="space" data-row="' + i + '" data-col="' + j + '">&nbsp;</div>');
                }
                spaces = spaces.concat('<br />');
            }
            $('#board').empty();
            $('#board').append(spaces);
        }

        this.explode = function () {
            for (let i = 0; i < this.row; i++) {
                for (let j = 0; j < this.col; j++) {
                    if (this.spaces[i][j].holds == -1) {
                        let dom_target = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
                        $(dom_target).addClass('bomb');
                        $(dom_target).html('<i class="fa fa-bomb"></i>');
                    }
                }
            }
            this.gameOver = true;
            $('#new-game').show();
            alert('perdiste!!!');
        }

        let numBombNear = function (row, col) {
            let sum = 0;

            if (this.spaces[row][col].holds == -1) {
                return -1;
            }

            sum += valueAt.call(this, row - 1, col - 1) + valueAt.call(this, row - 1, col) + valueAt.call(this, row - 1, col + 1)
                + valueAt.call(this, row, col - 1) + valueAt.call(this, row, col + 1)
                + valueAt.call(this, row + 1, col - 1) + valueAt.call(this, row + 1, col) + valueAt.call(this, row + 1, col + 1);

            return sum;
        }

        function valueAt(row, col) {
            if (row < 0 || row >= this.row || col < 0 || col >= this.col) {
                return 0;
            } else if (this.spaces[row][col].holds == -1) {
                return 1;
            } else {
                return 0;
            }
        }

        //Initializing the Object

        if (this.spaces !== undefined) {
            this.spaces = new Array(this.row);

            for (let i = 0; i < this.row; i++) {
                this.spaces[i] = new Array(this.col);
                for (let j = 0; j < this.col; j++) {
                    this.spaces[i][j] = new app.Space(false, 0);
                }
            }

            let min = 1;
            let max = this.row * this.col;
            this.bombCount = Math.round((Math.random() * ((max / 2) - min) + (min)));
            $('#value').html(this.bombCount);
            for (let i = 0; i < this.bombCount; i++) {
                let bombIndex = Math.round(Math.random() * (max - 1));
                let x = Math.floor(bombIndex / this.col);
                let y = bombIndex % this.col;
                this.spaces[x][y] = new app.Space(false, -1);
            }

            for (let i = 0; i < this.row; i++) {
                for (let j = 0; j < this.col; j++) {
                    this.spaces[i][j].holds = numBombNear.call(this, i, j);
                }
            }
        }

        this.clear = function (row, col) {
            let dom_target = 'div[data-row="' + (row + 1) + '"][data-col="' + (col + 1) + '"]';
            $(dom_target).addClass('safe');
            if (this.spaces[row][col].holds > 0) {
                $(dom_target).text(this.spaces[row][col].holds);
            } else {
                $(dom_target).html('&nbsp');
            }
            checkAllCellsExplored.call(this);
            this.spacesCleared++;
            this.spaces[row][col].explored = true;
        }

        function checkAllCellsExplored() {
            if (this.row * this.col - this.spacesCleared == this.bombCount) {
                for (i = 0; i < this.row; i++) {
                    for (j = 0; j < this.col; j++) {
                        if (this.spaces[i][j].holds == -1) {
                            let bomb_target = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
                            $(bomb_target).html('<i class="fa fa-smile-o"></i>');
                            this.gameOver = true;
                            $('#new-game').show();
                        }
                    }
                }
            }
        }

        function uncoverSurroundings(row, col) {
            checkSpace.call(this, row - 1, col - 1); checkSpace.call(this, row - 1, col); checkSpace.call(this, row - 1, col + 1);
            checkSpace.call(this, row, col - 1); checkSpace.call(this, row, col + 1);
            checkSpace.call(this, row + 1, col - 1); checkSpace.call(this, row + 1, col); checkSpace.call(this, row + 1, col + 1);
            checkAllCellsExplored.call(this);
        }

        function checkSpace(row, col) {
            if (row < 0 || row >= this.row || col < 0 || col >= this.col || this.spaces[row][col].explored == true) {
                return;
            } else if (this.spaces[row][col].holds >= 0) {
                this.clear(row, col);
                if (this.spaces[row][col].holds == 0) {
                    uncoverSurroundings.call(this, row, col);
                    return;
                }
            }
        }
    },

    //Space Object
    Space: function (explored, holds) {
        this.explored = explored;
        this.holds = holds;
    }
}

app.init();