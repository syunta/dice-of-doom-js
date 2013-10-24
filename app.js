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
        console.log( JSON.stringify(makeGameTree('A',currentGameTable,false,1),null,8) );
    }

    /* Data Structure*/
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
    
    /* Game Engine */
    function makeGameTree(player,gameTable,wasPassed,depth){
        return makePhase(player,gameTable,wasPassed,depth);
    }

    function makePhase(player,gameTable,wasPassed,depth){

        var justAfterAction = listAttackerAndBlocker(
            player,
            gameTable,
            listAttacker(player,gameTable),
            wasPassed,
            depth
        );

//        if(0 < justAfterAction.length){
//            return {
//                player            : player,
//                startingGameTable : gameTable,
//                actions           : listActions(player,gameTable,resetPass(),depth)
//            };
//        }else{
//            if(wasPassed == false){
//                return {
//                    action     : player + ' is Passed.',
//                    nextPlayer : makePhase(nextPlayer(player),gameTable,forciblyPass(),depth)
//                };
//            }else{
//                return gameOver();
//            }
//        }
    }

    function makePhaseAction(player,gameTable,wasPassed,depth){
        return {
            gameTable      : gameTable,
            nextActions    : listActions(player,gameTable,wasPassed,depth)
        };
    }

    function listActions(player,gameTable,wasPassed,depth){
        var attackerAndBloccker = listAttackerAndBlocker(
            player,
            gameTable,
            listAttacker(player,gameTable),
            wasPassed,
            depth
        );
    }
    
    function listAttackers(player,gameTable){
        var attackers = [];
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                if(gameTable[x][y].owner == player){
                    if(2 <= gameTable[x][y].dice){
                        attacker.push(gameTable[x][y]);
                    }
                }
            }
        }
        return attackers;
    }

    function listAttackerAndBlocker(player,gameTable,attacker,wasPassed,depth){
        var attackerAndBlocker = [];
        for(var i = 0; i < attacker.length; i++){
            var blocker = getLinkedHexes(gameTable,attacker[i].x,attacker[i].y);
            for(var j = 0; j < blocker.length; j++){
                if(blocker[j].owner != player){
                    if( blocker[j].dice < attacker[i].dice ){ //ver1 rule
                        attackerAndBlocker.push({
                            attacker : attacker[i],
                            blocker  : blocker[j]
                        });
//                        attackerAndBlocker[
//                            attacker[i].x + ':' + attacker[i].y + '->' +
//                            blocker[j].x + ':' + blocker[j].y
//                        ] = makePhaseAction(
//                            player,
//                            makeNextGameTable(
//                                player,
//                                gameTable,
//                                attacker[i],
//                                blocker[j]
//                            ),
//                            depth
//                        );
                    }
                }
            }
        }
        return attackerAndBlocker;
//        if( $.isEmptyObject(attackerAndBlocker) ){
//            return {
//                action   : 'active pass',
//                nextTurn : makePhase(nextPlayer(player),gameTable,wasPassed,depth)
//            };
//        }else{
//            return attackerAndBlocker;
//        }
    }

    function forciblyPass(){
        return true;
    }

    function resetPass(){
        return false;
    }
    
    function gameOver(){ // debbuging code
        return {Game:'Over'};
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
//        var players = ['A','B'];
//        for(var x = 1; x <= TABLE_SIZE; x++){
//            for(var y = 1; y <= TABLE_SIZE; y++){
//                gameTable[x][y].owner = players[getRandom(0,1)];
//                gameTable[x][y].dice = getRandom(1,3);
//            }
//        }
        gameTable[1][1].owner = 'B';
        gameTable[1][2].owner = 'B';
        gameTable[2][1].owner = 'A';
        gameTable[2][2].owner = 'A';
        gameTable[1][1].dice = 1;
        gameTable[1][2].dice = 1;
        gameTable[2][1].dice = 2;
        gameTable[2][2].dice = 2;

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
