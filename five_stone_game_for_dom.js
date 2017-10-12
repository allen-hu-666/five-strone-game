(function (window, document) {
    /* for extending class method */
    function extend(subClass, superClass) {
        function o() {
            this.constructor = subClass;
        }
        o.prototype = superClass.prototype;
        subClass.prototype = new o();
        return subClass.prototype;
    }

    function PieceBase(col, row, type) {
        this.COL = col; // integer between 1 and 15
        this.ROW = row; // integer between 1 and 15
        this.TYPE = type; // 'black' | 'white'
        this._relationPiece = {
            left: null,
            right: null,
            top: null,
            bottom: null,
            leftTop: null,
            rightTop: null,
            leftBottom: null,
            rightBottom: null,
        };
    }
    var PieceBaseP = PieceBase.prototype;
    PieceBaseP.relationCheck = function (piece /* PieceBase */ ) {
        if (piece.TYPE !== this.TYPE) return false;
    };
    PieceBaseP.setRelation = function (piece /* PieceBase */ ) {
        var colOffset = piece.COL - this.COL;
        var rowOffset = piece.ROW - this.ROW;
        if (
            piece.TYPE !== this.TYPE ||
            colOffset > 1 ||
            colOffset < -1 ||
            rowOffset > 1 ||
            rowOffset < -1
        ) return false;
        var relarion = this._relationPiece;
        if (colOffset === -1 && rowOffset === 0)
            relarion.left = piece;
        if (colOffset === 1 && rowOffset === 0)
            relarion.right = piece;
        if (colOffset === 0 && rowOffset === -1)
            relarion.top = piece;
        if (colOffset === 0 && rowOffset === 1)
            relarion.bottom = piece;
        if (colOffset === -1 && rowOffset === -1)
            relarion.leftTop = piece;
        if (colOffset === 1 && rowOffset === -1)
            relarion.rightTop = piece;
        if (colOffset === -1 && rowOffset === 1)
            relarion.leftBottom = piece;
        if (colOffset === 1 && rowOffset === 1)
            relarion.rightBottom = piece;
        return this;
    };
    PieceBaseP.findRelationPieceNumberByType = function (type, num) { // number
        if (num === undefined) num = 0;
        var relationPiece = this._relationPiece[type];
        if (!relationPiece) return num;
        num++;
        /* 责任链模式 */
        return relationPiece.findRelationPieceNumberByType(type, num);
    };
    PieceBaseP.isThis = function (piece /* PieceBase */ ) { //boolean
        if (piece.COL === this.COL && piece.ROW === this.ROW) {
            return true;
        } else {
            return false;
        }
    };
    PieceBaseP.removeRelationPiece = function (piece /* PieceBase */ ) {
        var relationPiece = this._relationPiece;
        //console.log(piece);
        for (var i in relationPiece) {
            if (!!relationPiece[i] && relationPiece[i].isThis(piece)) {
                relationPiece[i] = null;
                break;
            }
        }
        return this;
    };

    function Memento() {
        this._values = {};
    }
    var MementoP = Memento.prototype;
    MementoP.get = function (key) {
        var values = this.getValues(key);
        return values.pop();
    };
    MementoP.add = function (key, value) {
        if (!this._values[key])
            this._values[key] = [];
        this._values[key].push(value);
    };
    MementoP.getValues = function (key) {
        if (!this._values[key])
            this._values[key] = [];
        return this._values[key];
    };
    MementoP.removeALLMemento = function () {
        for (var i in this._values) {
            this._values[i] = [];
        }
    };

    function GameBase(el, boardWith) {
        this._boardEl = el;
        this._boardWith = boardWith;
        this._checkerWidth = boardWith / 15;
        this.status = 'waiting'; // 'waiting' | 'doing' | 'end';
        this.action = 'black'; // 'black' | 'white'
        this._pieces = [];
        this._memento = new Memento();
    }
    var GameBaseP = GameBase.prototype;
    GameBaseP.undo = function () {
        var piece = this._pieces.pop();
        this._memento.add('pieceIns', piece);
        this._removeRelations(piece);
        this._switchAction();
        return this;
    };
    GameBaseP.redo = function () {
        var piece = this._memento.get('pieceIns');
        this._setRelations(piece);
        this._pieces.push(piece);
        this._switchAction();
        return this;
    };
    GameBaseP.restart = function () {
        this.status = 'doing';
        this.action = 'black';
        this._pieces = [];
        this._memento.removeALLMemento();
    };
    GameBaseP.onActionChange = function (action) {};
    GameBaseP.onEnd = function (action) {};
    GameBaseP._switchAction = function () {
        this.action = (this.action === 'black') ? 'white' : 'black';
        this.onActionChange(this.action);
    };
    GameBaseP._addPiece = function (x, y) {
        var checkerWidth = this._checkerWidth;
        var action = this.action;
        var newPiece = new PieceBase(x, y, action);
        var pieces = this._pieces;
        for (var i in pieces) {
            if (pieces[i].isThis(newPiece)) return false;
        }
        this._setRelations(newPiece);
        this._pieces.push(newPiece);
        this._ifWin(newPiece);
        this._switchAction();
        this._memento.removeALLMemento();
        return newPiece;
    };
    GameBaseP._removeRelations = function (oldPiece) {
        for (var i in this._pieces) {
            this._pieces[i].removeRelationPiece(oldPiece);
        }
    }
    GameBaseP._setRelations = function (newPiece) {
        var pieces = this._pieces;
        for (var j in pieces) {
            (function () {
                var relationPiece = pieces[j].setRelation(newPiece);
                if (!!relationPiece) {
                    newPiece.setRelation(relationPiece);
                }
            })();
        }
    };
    GameBaseP._ifWin = function (newPiece) {
        var leftRightNum = newPiece.findRelationPieceNumberByType('left') + newPiece.findRelationPieceNumberByType('right') + 1;
        var topBottomNum = newPiece.findRelationPieceNumberByType('top') + newPiece.findRelationPieceNumberByType('bottom') + 1;
        var leftTopNum = newPiece.findRelationPieceNumberByType('leftTop') + newPiece.findRelationPieceNumberByType('rightBottom') + 1;
        var rightTopNum = newPiece.findRelationPieceNumberByType('rightTop') + newPiece.findRelationPieceNumberByType('leftBottom') + 1;
        if (
            leftRightNum >= 5 ||
            topBottomNum >= 5 ||
            leftTopNum >= 5 ||
            rightTopNum >= 5
        ) {
            this.status = 'end';
            this.onEnd(this.action);
            return true;
        } else {
            return false;
        }
    }

    function GameForDom(el, boardWith) {
        var self = this;
        GameBase.call(this, el, boardWith);
        this._pieceContentDom = null;
        el.addEventListener('click', function (ev) {
            //console.log(self.status);
            if (!!ev.srcElement.className.match('piece') ||
                self.status !== 'doing'
            ) return;
            var checkerWidth = self._checkerWidth;
            var col = Math.floor(ev.layerX / checkerWidth) + 1;
            var row = Math.floor(ev.layerY / checkerWidth) + 1;
            self._addPiece(col, row);
        });
        this._setBoardWith(boardWith);
        this._drawBoardBackground()
    }
    window.FiveStoneGameForDom = GameForDom;
    var GameForDomP = extend(GameForDom, GameBase);
    GameForDomP._setBoardWith = function (width) {
        this._boardEl.style.width = (this._boardWith - this._checkerWidth) + 'px';
        this._boardEl.style.padding = this._checkerWidth / 2 + 'px';
        return this;
    };
    GameForDomP.startGame = function () {
        this.status = 'doing';
        return this;
    };
    GameForDomP.restart = function () {
        GameBase.prototype.restart.call(this);
        this._pieceContentDom.innerHTML = '';
    };
    GameForDomP.undo = function () {
        var lastChild = this._pieceContentDom.lastElementChild;
        if (!lastChild) return false;
        GameBase.prototype.undo.call(this);
        this._pieceContentDom.removeChild(lastChild);
        this._memento.add('pieceEl', lastChild);
        return this;
    };
    GameForDomP.redo = function () {
        var pieceEl = this._memento.get('pieceEl');
        if (!pieceEl) return false;
        GameBase.prototype.redo.call(this);
        this._pieceContentDom.appendChild(pieceEl);
        return this;
    };
    GameForDomP._drawBoardBackground = function () {
        this._pieceContentDom = document.createElement('div');
        this._boardEl.appendChild(this._pieceContentDom);

        var checkerWidth = this._checkerWidth;
        var boardEl = this._boardEl;
        var checkerContent = document.createElement('div');
        checkerContent.classList.add('checker-content');
        checkerContent.style.width = checkerWidth * 14 + 'px';
        boardEl.appendChild(checkerContent);

        for (var i = 0; i < 14 * 14; i++) {
            (function () {
                var checker = document.createElement('div');
                checker.classList.add('checker');
                checker.style.width = (checkerWidth - 1) + 'px';
                checker.style.height = (checkerWidth - 1) + 'px';
                checkerContent.appendChild(checker);
            })();
        }

        var clearFloat = document.createElement('div');
        clearFloat.style.clear = 'both';
        checkerContent.appendChild(clearFloat);
    };
    GameForDomP._addPiece = function (x, y) {
        var newPiece = GameBase.prototype._addPiece.call(this, x, y);
        if (!newPiece) return false;
        var checkerWidth = this._checkerWidth;
        var pieceWidth = checkerWidth * 0.8;
        var pieceX = (newPiece.COL - 1) * checkerWidth + checkerWidth * 0.1;
        var pieceY = (newPiece.ROW - 1) * checkerWidth + checkerWidth * 0.1;
        var pieceDom = document.createElement('div');
        pieceDom.classList.add('piece');
        pieceDom.classList.add(newPiece.TYPE);
        pieceDom.style.width = pieceDom.style.height = pieceWidth + 'px';
        pieceDom.style.left = pieceX + 'px';
        pieceDom.style.top = pieceY + 'px';
        this._pieceContentDom.appendChild(pieceDom);
        return newPiece;
    };

    /* usage */
    document.addEventListener('DOMContentLoaded', function () {
        var boardEl = document.getElementById('five-stone-board');
        var undoButtonEl = document.getElementById('undo');
        var redoButtonEl = document.getElementById('redo');
        var restartButtonEl = document.getElementById('restart');
        var game = new GameForDom(boardEl, 600);
        game.startGame();
        game.onEnd = function (action) {
            setTimeout(function () {
                window.alert(action + ' win the game!');
            }, 50);
        };
        game.onActionChange = function (action) {
            var actionEl = document.getElementById('who-action');
            actionEl.style.background = action;
        };
        undoButtonEl.addEventListener('click', function () {
            if (!game.undo())
                alert("没有可悔的棋！");
        });
        redoButtonEl.addEventListener('click', function () {
            if (!game.redo())
                alert("没有可撤销的悔棋！");
        });
        restartButtonEl.addEventListener('click', function () {
            game.restart();
        });
    });
})(window, document);