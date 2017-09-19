'use strict';
$(document).ready(function () {
    newGame('reg');
    $('#new-game').hide();

    $('#difficulty li').click(function (eventObject) {
        $('#difficulty li').removeClass('selected');
        $(this).addClass('selected');
        let difficulty = $(this).attr('id');
        newGame(difficulty);
        $('#new-game').hide();
    });

    $('#new-game').click(function (eventObject) {
        let difficulty = $('#difficulty li.selected').attr('id');
        newGame(difficulty);
        $('#new-game').hide();
    });
});

// Drawing de board for new game
function newGame(difficulty) {
    let board;
    switch (difficulty) {
        case 'easy':
            board = new Board(6, 6);
            break;
        case 'hard':
            board = new Board(8, 8);
            break;
        case 'reg':
        default:
            board = new Board(10, 10);
            break;
    }
    board.render();
    board.gameOver = false;

    $('.space').click(function (eventObject) {
        board.click(eventObject.target);
    });

    return board;
}

// Board Object
function Board(row, col) {
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
            discovering.call(this, row - 1, col - 1);
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

    if (this.spaces !== undefined) {
        this.spaces = new Array(this.row);

        for (let i = 0; i < this.row; i++) {
            this.spaces[i] = new Array(this.col);
            for (let j = 0; j < this.col; j++) {
                this.spaces[i][j] = new Space(false, 0);
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
            this.spaces[x][y] = new Space(false, -1);
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
            for (let i = 0; i < this.row; i++) {
                for (let j = 0; j < this.col; j++) {
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

    function discovering(row, col) {
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
                discovering.call(this, row, col);
                return;
            }
        }
    }
}

function Space(explored, holds) {
    this.explored = explored;
    this.holds = holds;
}