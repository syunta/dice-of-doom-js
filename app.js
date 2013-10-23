$(function(){
    
    var TABLE_SIZE = 5;
    var TURN = {
        'A':{next:'B'},
        'B':{next:'A'}
    };

    var currentGameTable = {};

    startApp();

    function startApp(){
        var gameTable = createGameTable();
        console.log( JSON.stringify(gameTable,null,8) );
        console.log( JSON.stringify(getLinkedHexes(gameTable,1,1),null,8) );
//        currentGameTable = setInitialGameTable( createGameTable() );
//        drawGameTable(currentGameTable);
//        console.log( JSON.stringify(makeGameTree(),null,8) );
//        console.log( makeGameTree() );
    }

    function createGameTable(){
        var gameTable = [];
        for(var x = 0; x <= TABLE_SIZE+1; x++){
            gameTable[x] = [];
        }
        for(var y = 0; y <= TABLE_SIZE+1; y++){
            for(var x = 0; x <= TABLE_SIZE+1; x++){
                if(y == 0 || x == 0){
                    gameTable[x][y] = {};
                }else if(y == TABLE_SIZE+1 || x == TABLE_SIZE+1){
                    gameTable[x][y] = {};
                }else{
                    gameTable[x][y] = {
                        owner : x, // debbuging code
                        dice  : y  // debbuging code
                    };
                }
            }
        }
        return gameTable;
    }
    
    function getLinkedHexes(gameTable,x,y){
        var linkedHexes 
            = getUpwardHexes(gameTable,x,y).concat(
                getHorizontalHexes(gameTable,x,y),
                getDownwardHexes(gameTable,x,y)
              );
        return linkedHexes;
    }
    
    function getUpwardHexes(gameTable,x,y){
        var upwardHexes = [];
        upwardHexes.push(gameTable[x+1][y+1]);
        upwardHexes.push(gameTable[x][y+1]);
        return upwardHexes;
    }

    function getHorizontalHexes(gameTable,x,y){
        var horizontalHexes = [];
        horizontalHexes.push(gameTable[x-1][y]);
        horizontalHexes.push(gameTable[x+1][y]);
        return horizontalHexes;
    }

    function getDownwardHexes(gameTable,x,y){
        var downwardHexes =[];
        downwardHexes.push(gameTable[x][y-1]);
        downwardHexes.push(gameTable[x-1][y-1]);
        return downwardHexes;
    }

    function makeGameTree(){
        var player = 'A';
//      var wasPassed = false;
        var depth = 1; // debugging code

        return makePhase(player,currentGameTable,depth);
    }

    function makePhase(player,gameTable,depth){
        return {
            player            : player,
            startingGameTable : gameTable,
            actions           : listActions(player,gameTable,depth)
        };
    }

    function makePhaseAction(player,gameTable,depth){
        return {
            gameTable      : gameTable,
            nextActions    : listActions(player,gameTable,depth)
        };
    }

    function listActions(player,gameTable,depth){
        return listAttackedEnemyHexes(
            player,
            gameTable,listAttackingHexes(player,gameTable),
            depth
        );
    }
    
    function listAttackingHexes(player,gameTable){
        var attackingHexes = [];
        for(var i = 0; i < TABLE_ROW.length; i++){
            for(var j = 0; j < TABLE_COLUMN.length; j++){
                if(gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].owner == player){
                    if(2 <= gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].dice){
                        attackingHexes.push(TABLE_ROW[i]+TABLE_COLUMN[j]);
                    }
                }
            }
        }
        return attackingHexes;
    }

    function listAttackedEnemyHexes(player,gameTable,attackingHexes,depth){
        var attackedEnemyHexes = {};
        for(var i = 0; i < attackingHexes.length; i++){
            var linkedHexes = gameTable[ attackingHexes[i] ].link;
            for(var j = 0; j < linkedHexes.length; j++){
                if(gameTable[ linkedHexes[j] ].owner != player){
                    if(gameTable[ linkedHexes[j] ].dice < gameTable[ attackingHexes[i] ].dice){ //ver1 rule
                        attackedEnemyHexes[ attackingHexes[i] + '->' +linkedHexes[j] ] = makePhaseAction(
                            player,
                            makeNextGameTable(
                                player,
                                gameTable,
                                attackingHexes[i],
                                linkedHexes[j]
                            ),
                            depth
                        );
                    }
                }
            }
        }
        if( $.isEmptyObject(attackedEnemyHexes) ){
            // call method,makePhase()
            return turnEnd();
        }else{
            return attackedEnemyHexes;
        }
    }
    
    /* debugging code */
    function turnEnd(){
        return {'turn':'end'};
    }

    function makeNextGameTable(player,gameTable,attackingHex,attackedHex){
        var nextGameTable = $.extend(true,{},gameTable);
       
        nextGameTable[attackedHex].owner = player;

        var dice = nextGameTable[attackingHex].dice;
        nextGameTable[attackingHex].dice = 1;
        nextGameTable[attackedHex].dice = dice - 1;

        return nextGameTable;
    }

    function nextPlayer(player){
        return TURN[player].next;
    }

    function setInitialGameTable(gameTable){
        var players = ['A','B'];
        for(var i = 0; i < TABLE_ROW.length; i++){
            for(var j = 0; j < TABLE_COLUMN.length; j++){
                gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].owner = players[getRandom(0,1)];
                gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].dice = getRandom(1,3);
            }
        }
        return gameTable;
    }

    function getRandom(min,max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* UI */
    function drawGameTable(gameTable){
        var tableFrame = '';
        var space = '&nbsp;&nbsp;&nbsp;';

        for(var i = 0; i < TABLE_ROW.length; i++){
            for(var j = TABLE_COLUMN.length; i < j; j--){
                tableFrame += space;
            }
            for(var j = 0; j < TABLE_COLUMN.length; j++ ){
                tableFrame += 
                    '<span id = ' + TABLE_ROW[i] + TABLE_COLUMN[j] + '>' +
                    gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].owner + ':' +
                    gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].dice +
                    '</span>' + space;
            }

            tableFrame += '</br>';
        }
        $("body").html(tableFrame);
    }

    $("body").on('click','span',function(){
        getStatus( $(this).attr('id') );
    });

    function getStatus(id){
        console.log( currentGameTable[id] );
    }
});
