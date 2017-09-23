'use strict';
class Setup {
    constructor(board) {
        
        this.board = undefined;

        this.newGame('medium');
        $('#new-game').hide();

        $('#difficulty li').on('click', (event) => {
            $('#difficulty li').removeClass('selected');
            $(event.target).addClass('selected');
            let difficulty = $(event.target).attr('id');
            this.newGame(difficulty);
            $('#new-game').hide();
        });

        $('#new-game').on('click', (event) => {
            let difficulty = $('#difficulty li.selected').attr('id');
            this.newGame(difficulty);
            $('#new-game').hide();
        });
    }

    newGame(difficulty) {
        switch (difficulty) {
            case 'easy':
                this.board = new Player(6, 6);
                break;
            case 'hard':
                this.board = new Player(10, 10);
                break;
            case 'medium':
            default:
                this.board = new Player(8, 8);
                break;
        }
        this.board.render();
        this.board.gameOver = false;

        $('.space').on('click', (event) => {
            this.board.click(event.target);
        });

        return this.board;
    }
}

class Space {
    constructor(explored, holds) {
        this.explored = explored;
        this.holds = holds;
    }
}

class Player {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.spaces = [];
        this.gameOver = false;
        this.spacesCleared = 0;
        this.bombCount = 0;

        this.click = (target_elem) => {
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

        this.render = () => {
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

        this.explode = () => {
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

        let numBombNear = (row, col) => {
            let sum = 0;

            if (this.spaces[row][col].holds == -1) {
                return -1;
            }

            sum += this.valueAt.call(this, row - 1, col - 1) + this.valueAt.call(this, row - 1, col) + this.valueAt.call(this, row - 1, col + 1)
                + this.valueAt.call(this, row, col - 1) + this.valueAt.call(this, row, col + 1)
                + this.valueAt.call(this, row + 1, col - 1) + this.valueAt.call(this, row + 1, col) + this.valueAt.call(this, row + 1, col + 1);

            return sum;
        }

        this.clear = (row, col) => {
            let dom_target = 'div[data-row="' + (row + 1) + '"][data-col="' + (col + 1) + '"]';
            $(dom_target).addClass('safe');
            if (this.spaces[row][col].holds > 0) {
                $(dom_target).text(this.spaces[row][col].holds);
            } else {
                $(dom_target).html('&nbsp');
            }
            this.checkAllCellsExplored.call(this);
            this.spacesCleared++;
            this.spaces[row][col].explored = true;
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

    }

    valueAt(row, col) {
        if (row < 0 || row >= this.row || col < 0 || col >= this.col) {
            return 0;
        } else if (this.spaces[row][col].holds == -1) {
            return 1;
        } else {
            return 0;
        }
    }

    checkAllCellsExplored() {
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

    discovering(row, col) {
        this.checkSpace.call(this, row - 1, col - 1); this.checkSpace.call(this, row - 1, col); this.checkSpace.call(this, row - 1, col + 1);
        this.checkSpace.call(this, row, col - 1); this.checkSpace.call(this, row, col + 1);
        this.checkSpace.call(this, row + 1, col - 1); this.checkSpace.call(this, row + 1, col); this.checkSpace.call(this, row + 1, col + 1);
        this.checkAllCellsExplored.call(this);
    }

    checkSpace(row, col) {
        if (row < 0 || row >= this.row || col < 0 || col >= this.col || this.spaces[row][col].explored == true) {
            return;
        } else if (this.spaces[row][col].holds >= 0) {
            this.clear(row, col);
            if (this.spaces[row][col].holds == 0) {
                this.discovering.call(this, row, col);
                return;
            }
        }
    }
}

let setup = new Setup();