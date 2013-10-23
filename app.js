$(function(){
    
    var TABLE_SIZE = 2;
    var TURN = {
        A:{next:'B'},
        B:{next:'A'}
    };

    var currentGameTable = {};

    startApp();

    function startApp(){
        currentGameTable = setInitialGameTable( createGameTable() );
        drawGameTable(currentGameTable);
        console.log( JSON.stringify(makeGameTree(),null,8) );
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
                        x     : x,
                        y     : y,
                        owner : null,
                        dice  : 0
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
        if(!$.isEmptyObject(gameTable[x+1][y+1])){
            upwardHexes.push(gameTable[x+1][y+1]);
        }
        if(!$.isEmptyObject(gameTable[x][y+1])){
            upwardHexes.push(gameTable[x][y+1]);
        }
        return upwardHexes;
    }

    function getHorizontalHexes(gameTable,x,y){
        var horizontalHexes = [];
        if(!$.isEmptyObject(gameTable[x-1][y])){
            horizontalHexes.push(gameTable[x-1][y]);
        }
        if(!$.isEmptyObject(gameTable[x+1][y])){
            horizontalHexes.push(gameTable[x+1][y]);
        }
        return horizontalHexes;
    }

    function getDownwardHexes(gameTable,x,y){
        var downwardHexes =[];
        if(!$.isEmptyObject(gameTable[x][y-1])){
            downwardHexes.push(gameTable[x][y-1]);
        }
        if(!$.isEmptyObject(gameTable[x-1][y-1])){
            downwardHexes.push(gameTable[x-1][y-1]);
        }
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
            gameTable,
            listAttackingHexes(player,gameTable),
            depth
        );
    }
    
    function listAttackingHexes(player,gameTable){
        var attackingHexes = [];
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                if(gameTable[x][y].owner == player){
                    if(2 <= gameTable[x][y].dice){
                        attackingHexes.push(gameTable[x][y]);
                    }
                }
            }
        }
        return attackingHexes;
    }

    function listAttackedEnemyHexes(player,gameTable,attackingHexes,depth){
        var attackedEnemyHexes = {};
        for(var i = 0; i < attackingHexes.length; i++){
            var linkedHexes = getLinkedHexes(gameTable,attackingHexes[i].x,attackingHexes[i].y);
            for(var j = 0; j < linkedHexes.length; j++){
                if(linkedHexes[j].owner != player){
                    if( linkedHexes[j].dice < attackingHexes[i].dice ){ //ver1 rule
                        attackedEnemyHexes[
                            attackingHexes[i].x + ':' + attackingHexes[i].y + '->' +
                            linkedHexes[j].x + ':' + linkedHexes[j].y
                        ] = makePhaseAction(
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
    
    function turnEnd(){ // debbuging code
        return {turn:'end'};
    }

    function makeNextGameTable(player,gameTable,attackingHex,attackedHex){
        var nextGameTable = $.extend(true,{},gameTable);
       
        nextGameTable[attackedHex.x][attackedHex.y].owner = player;

        var dice = nextGameTable[attackingHex.x][attackingHex.y].dice;
        nextGameTable[attackingHex.x][attackingHex.y].dice = 1;
        nextGameTable[attackedHex.x][attackedHex.y].dice = dice - 1;

        return nextGameTable;
    }

    function nextPlayer(player){
        return TURN[player].next;
    }

    function setInitialGameTable(gameTable){
        var players = ['A','B'];
        for(var x = 1; x <= TABLE_SIZE; x++){
            for(var y = 1; y <= TABLE_SIZE; y++){
                gameTable[x][y].owner = players[getRandom(0,1)];
                gameTable[x][y].dice = getRandom(1,3);
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

        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = TABLE_SIZE; y <= x; x--){
                tableFrame += space;
            }
            for(var x = 1; x <= TABLE_SIZE; x++ ){
                tableFrame += 
                    '<span id = ' + x + y + '>' +
                    gameTable[x][y].owner + ':' +
                    gameTable[x][y].dice +
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
        var x = id.charAt(0); 
        var y = id.charAt(1); 
        console.log( currentGameTable[x][y] );
    }
});
