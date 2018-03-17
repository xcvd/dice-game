var app = new PIXI.Application(510, 270, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

PIXI.loader
    .add('sprites.json')
    .load(onAssetsLoaded);

var sprite_files = ['one.png', 'two.png', 'three.png', 'four.png', 'five.png', 'six.png']
var grid_states = [[], [], [], []]
var currentThrow = []
var win_lines = [[0,0,0], [1,1,1], [2,2,2], [0,1,2], [2,1,0]]
var grid_dice = []
var score_text = new PIXI.Text("Total score: 0");
var grid_scores = [new PIXI.Text("Score: 0"),new PIXI.Text("Score: 0"),new PIXI.Text("Score: 0"),new PIXI.Text("Score: 0")]
var line_graphics = new PIXI.Graphics();
var text_opts = [];
var refresh_text = 0;

function throwDice()
{
    return [Math.floor(Math.random()*6), Math.floor(Math.random()*6), Math.floor(Math.random()*6)];
}

function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
    if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
    }
    event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = event => {
    if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
    }
    event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
    "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
    "keyup", key.upHandler.bind(key), false
    );
    return key;
}


function addGameBoard()
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0x1099bb, 1);
    for (g = 0; g < 4; g++) {
        for (i = 0; i < 3; i++) { 
            for (j = 0; j < 3; j++) {
                graphics.drawRect(30+i*30 + g*120, 150+j*30, 30, 30);
            }
        }
        var basicText = new PIXI.Text(g == 0 ? 'a' : g == 1 ? 's' : g == 2 ? 'd' : 'f');
        basicText.x = 68 + g*120;
        basicText.y = 120;
        basicText.interactive = true;
        text_opts.push(basicText);
        grid_scores[g].x = 30 + g*120;
        grid_scores[g].y = 240;
        app.stage.addChild(grid_scores[g])
        app.stage.addChild(basicText);
    }
    refresh_text = new PIXI.Text("Press 'r' to restart.");
    refresh_text.x = 30;
    refresh_text.y = 30;
    refresh_text.interactive = true;
    app.stage.addChild(refresh_text);
    
    score_text.x = 30;
    score_text.y = 75;
    app.stage.addChild(score_text);
    app.stage.addChild(graphics);
    app.stage.addChild(line_graphics);
}

function throwAndDrawDice()
{
    current_throw = throwDice();    
    var i = 0;
    current_throw.forEach( function(x) {
        var dice = PIXI.Sprite.fromFrame(sprite_files[x]);
        dice.anchor.set(0);
        dice.x = 420;
        dice.y = 30 + 30*i;
        app.stage.addChild(dice);
        i += 1;
    })
    var grid_idx = 0;
    grid_dice.forEach( (x) => {
            app.stage.removeChild(x);
        })
    app.stage.removeChild(line_graphics);

    grid_states.forEach( function(grid_state) {
        var column_idx = 0;
        grid_state.forEach( function(column) {
            var row_idx = 0;
            column.forEach( function(x) {
                var dice = PIXI.Sprite.fromFrame(sprite_files[x]);                
                grid_dice.push(dice)
                dice.anchor.set(0);
                dice.x = 30 + column_idx*30 + grid_idx*120;
                dice.y = 150 + 30*row_idx;
                app.stage.addChild(dice);
                row_idx += 1;
            })
            column_idx += 1;
        })
        grid_idx += 1;
    })
    
    var win_lines = [[0,0,0], [1,1,1], [2,2,2], [0,1,2], [2,1,0]]
    
    line_graphics = new PIXI.Graphics();
    line_graphics.lineStyle(2, 0xff0000, 1);
    var grid_idx = 0;
    var total_points = 0;        
    grid_states.forEach( function(grid_state) {
        if (grid_state.length == 3) {
            var points = 0;
            win_lines.forEach( function(win_line) {
                if (grid_state[0][win_line[0]] == grid_state[1][win_line[1]] &&
                    grid_state[0][win_line[0]] == grid_state[2][win_line[2]]) {                    
                    points += (grid_state[0][win_line[0]] + 1);                                        
                    line_graphics.moveTo(45 + 120 * grid_idx, 165 + 30 * win_line[0])
                    line_graphics.lineTo(105 + 120 * grid_idx, 165 + 30 * win_line[2])
                }
            })
            total_points += points;
            grid_scores[grid_idx].text = 'Score: ' + points;
        }
        grid_idx += 1;     
    })
    app.stage.addChild(line_graphics);
    score_text.text = 'Total score: ' + total_points;
}


function onAssetsLoaded()
{
    addGameBoard();
    throwAndDrawDice();
    let a_key = keyboard(65);
    let s_key = keyboard(83);
    let d_key = keyboard(68);
    let f_key = keyboard(70);
    let r_key = keyboard(82);

    a_key.press = () => {
        if (grid_states[0].length < 3) {
            grid_states[0].push(current_throw)
            throwAndDrawDice();
        }
    };
    s_key.press = () => {
        if (grid_states[1].length < 3) {
            grid_states[1].push(current_throw)
            throwAndDrawDice();
        }
    }
    d_key.press = () => {
        if (grid_states[2].length < 3) {
            grid_states[2].push(current_throw)
            throwAndDrawDice();
        }
    }
    f_key.press = () => {
        if (grid_states[3].length < 3) {
            grid_states[3].push(current_throw)
            throwAndDrawDice();
        }
    }    
    r_key.press = () => {        
        grid_states = [[], [], [], []];
        grid_scores.forEach( function(grid_score) {
            grid_score.text = 'Score: 0';
        })
        throwAndDrawDice();
    }
}
