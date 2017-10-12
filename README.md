### 五子棋插件使用说明

* PieceBase，Memento，GameBase 类为逻辑部分，没有依赖dom；
* GameForDom 类为Dom渲染部分，若要用canvas实现，只需要把这个类替换成canvas对应实现的类；

#### DEMO
```javascript
    document.addEventListener('DOMContentLoaded', function () {
        var boardEl = document.getElementById('five-stone-board');
        var undoButtonEl = document.getElementById('undo');
        var redoButtonEl = document.getElementById('redo');
        var restartButtonEl = document.getElementById('restart');
        var game = new window.FiveStoneGameForDom(boardEl, 600);
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
            if(!game.undo())
                alert("没有可悔的棋！");
        });
        redoButtonEl.addEventListener('click', function () {
            if(!game.redo())
                alert("没有可撤销的悔棋！");
        });
        restartButtonEl.addEventListener('click', function () {
            game.restart();
        });
    });
```# five-strone-game
