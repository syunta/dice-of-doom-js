$(function(){
    
    var TABLE_SIZE = 2;
    var TURN = {
        A:{next:'B'},
        B:{next:'A'}
    };
    var LIMIT_VALUE_DICE_NUMBERS= 3;

    var currentGameTable = {};

    startApp();

    function startApp(){
        currentGameTable = setInitialGameTable( createGameTable() );
        drawGameTable(currentGameTable);
        makeGameTree('A',currentGameTable,false,1);
        console.log( JSON.stringify(makeGameTree('A',currentGameTable,false,1),null,4) );
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
        var canAction = checkAnyOfAction(player,gameTable);
            
        if(canAction){
            return makeActionsTree(player,gameTable,resetPass(),depth);
        }else{
            if(wasPassed == false){
                return {
                    action     : player + ' has no action',
                    nextPlayer : makePhase(nextPlayer(player),gameTable,forciblyPass(),depth)
                };
            }else{
                return {
                    action : player + ' has no action',
                    result : judgeVictoryAndDefeat()
                };
            }
        }
    }

    function makeActionsTree(player,gameTable,wasPassed,depth){
        var removedDice = 0;
        return {
            player            : player,
            startingGameTable : gameTable,
            actions           : listActions(player,gameTable,removedDice,wasPassed,depth)
        };
    }

    function makePhaseActions(player,gameTable,removedDice,wasPassed,depth){
        return {
            gameTable      : gameTable,
            nextActions    : listActions(player,gameTable,removedDice,wasPassed,depth)
        };
    }

    function listActions(player,gameTable,removedDice,wasPassed,depth){
        var nextActions = {};
        var attackers = listAttackers(player,gameTable);

        for(var i = 0; i < attackers.length; i++){
            var blockers = listBlockersAgainstOneAttacker(player,gameTable,attackers[i]);
            for(var j = 0; j < blockers.length; j++){
                nextActions[
                    attackers[i].x + ':' + attackers[i].y + '->' +
                    blockers[j].x + ':' + blockers[j].y
                ] = makePhaseActions(
                    player,
                    makeAttackedGameTable(player,gameTable,attackers[i],blockers[j]),
                    addRemovedDice(removedDice,blockers[j].dice),
                    wasPassed,
                    depth
                );
            }
        }
        if( $.isEmptyObject(nextActions) ){
            nextActions['active pass'] = activePass(
                player,
                gameTable,
                removedDice,
                wasPassed,
                depth
            );
            return nextActions;
        }else{
            return nextActions;
        }
    }

    function addRemovedDice(removedDice,additionalDice){
        return removedDice + additionalDice;
    }

    function activePass(player,gameTable,removedDice,wasPassed,depth){
        return {
            nextPlayer : makePhase(
                            nextPlayer(player),
                            makeSuppliedGameTable(player,gameTable,removedDice),
                            wasPassed,
                            depth
                         )
        };
    }

    function checkAnyOfAction(player,gameTable){
        var canAction = false;
        var attackers = listAttackers(player,gameTable);

        for(var i = 0; i < attackers.length; i++){
            var blockers = listBlockersAgainstOneAttacker(player,gameTable,attackers[i]);
            for(var j = 0; j < blockers.length; j++){
                canAction = true;
                break;
            }
        }
        return canAction;
    }
    
    function listAttackers(player,gameTable){
        var attackers = [];
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                if(gameTable[x][y].owner == player){
                    if(2 <= gameTable[x][y].dice){
                        attackers.push(gameTable[x][y]);
                    }
                }
            }
        }
        return attackers;
    }

    function listBlockersAgainstOneAttacker(player,gameTable,attacker){
        var blockers = [];
        var possibleBlockers = getLinkedHexes(gameTable,attacker.x,attacker.y);
        for(var i = 0; i < possibleBlockers.length; i++){
            if(possibleBlockers[i].owner != player){
                if( possibleBlockers[i].dice < attacker.dice ){ //ver1 rule
                    blockers.push(possibleBlockers[i]);
                }
            }
        }
        return blockers;
    }

    function forciblyPass(){
        return true;
    }

    function resetPass(){
        return false;
    }
    
    function judgeVictoryAndDefeat(){
        var result = {};
        return result;
    }

    function makeAttackedGameTable(player,gameTable,attackingHex,attackedHex){
        var attackedGameTable = $.extend(true,{},gameTable);
       
        attackedGameTable[attackedHex.x][attackedHex.y].owner = player;

        var dice = attackedGameTable[attackingHex.x][attackingHex.y].dice;
        attackedGameTable[attackingHex.x][attackingHex.y].dice = 1;
        attackedGameTable[attackedHex.x][attackedHex.y].dice = dice - 1;

        return attackedGameTable;
    }

    function makeSuppliedGameTable(player,gameTable,removedDice){
        var suppliedGameTable = $.extend(true,{},gameTable);
        var totalSupplyDice = removedDice - 1;
        var remainingDice = totalSupplyDice;
        var supplyDice = 1;
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                if(suppliedGameTable[x][y].owner == player && suppliedGameTable[x][y].dice < LIMIT_VALUE_DICE_NUMBERS){
                    if(remainingDice < supplyDice){
                        supplyDice = remainingDice;
                    }
                    remainingDice -= supplyDice;
                    suppliedGameTable[x][y].dice += supplyDice;
                }
                if(remainingDice == 0)break;
            }
        }
        return suppliedGameTable;
    }

    function nextPlayer(player){
        return TURN[player].next;
    }

    function setInitialGameTable(gameTable){
        var players = ['A','B'];
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                gameTable[x][y].owner = players[getRandom(0,1)];
                gameTable[x][y].dice = getRandom(1,LIMIT_VALUE_DICE_NUMBERS);
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
