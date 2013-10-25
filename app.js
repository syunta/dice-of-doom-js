$(function(){
    
    var TABLE_SIZE = 2;
    var TURN = {
        A:{next:'B'},
        B:{next:'A'}
    };
    var LIMIT_VALUE_DICE_NUMBERS= 3;

    var currentGameTree = {};

    startApp();

    function startApp(){
        gameTree = makeGameTree('A',setInitialGameTable(createGameTable()));
        currentGameTree = gameTree;
        drawGameTable(currentGameTree.gameTable);
        attack(currentGameTree.action);
        console.log( JSON.stringify(gameTree,null,4) );
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

    function listAttackers(player,gameTable){
        var attackers = [];
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                if(gameTable[x][y].owner == player){
                    if(2 <= gameTable[x][y].dice){
                        if(listBlockersAgainstOneAttacker(player,gameTable,gameTable[x][y]).length != 0){ //ver1 rule
                            attackers.push(gameTable[x][y]);
                        }
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

    function forciblyPass(){
        return true;
    }

    function resetPass(){
        return false;
    }

    function enableToPass(){
        return true;
    }
    
    function countDomain(gameTable){
        var result = {A:0,B:0};
        for(var y = 1; y <= TABLE_SIZE; y++){
            for(var x = 1; x <= TABLE_SIZE; x++){
                result[gameTable[x][y].owner] += 1;
            }
        }
        return result;
    }

    function addRemovedDice(removedDice,additionalDice){
        return removedDice + additionalDice;
    }

    /* Record of a game of go */
    function makeGameTree(player,gameTable){
        var wasPassed = false;
        var depth = 1;
        return makePhase(player,gameTable,wasPassed,depth);
    }

    function makePhase(player,gameTable,wasPassed,depth){
        var canAction = checkAnyOfAction(player,gameTable);
            
        if(canAction){
            return makeActionsTree(player,gameTable,resetPass(),depth);
        }else{
            if(!wasPassed){
                return {
                    action    : {actType : player + ' has no action'},
                    gameTable : gameTable,
                    next      : makePhase(nextPlayer(player),gameTable,forciblyPass(),depth)
                };
            }else{
                return {
                    action    : {actType : player + ' has no action'},
                    gameTable : gameTable,
                    next      : gameOver(gameTable)
                };
            }
        }
    }

    function makeActionsTree(player,gameTable,wasPassed,depth){
        var removedDice = 0;
        var canPass = false;
        return {
            player    : player,
            gameTable : gameTable,
            action    : listActions(player,gameTable,removedDice,canPass,wasPassed,depth)
        };
    }

    function makePhaseActions(player,gameTable,removedDice,canPass,wasPassed,depth){
        return {
            player    : player,
            gameTable : gameTable,
            action    : listActions(player,gameTable,removedDice,canPass,wasPassed,depth)
        };
    }

    function listActions(player,gameTable,removedDice,canPass,wasPassed,depth){
        var actions = [];
        var attackers = listAttackers(player,gameTable);

        for(var i = 0; i < attackers.length; i++){
            actions.push({
                actType : 'attack',
                x       : attackers[i].x,
                y       : attackers[i].y,
                next    : listBlockerSelections(
                    player,
                    gameTable,
                    removedDice,
                    attackers[i],
                    enableToPass(),
                    depth
                )
            });
        }

        if(actions.length == 0){
            actions.push({
                actType : 'end all possible',
                next    :  activePass(
                    player,
                    gameTable,
                    removedDice,
                    wasPassed,
                    depth
                )
            });
            return actions;
        }else if(canPass){
            actions.push({
                actType : 'active pass',
                next    :  activePass(
                    player,
                    gameTable,
                    removedDice,
                    wasPassed,
                    depth
                )
            });
            return actions;
        }else{
            return actions;
        }
    }
    
    function listBlockerSelections(player,gameTable,removedDice,attacker,canPass,wasPassed,depth){
        var actions = [];
        var blockers = listBlockersAgainstOneAttacker(player,gameTable,attacker);
        for(var i = 0; i < blockers.length; i++){
            actions.push({
                actType : 'block',
                x       : blockers[i].x,
                y       : blockers[i].y,
                next    : makePhaseActions(
                    player,
                    makeAttackedGameTable(player,gameTable,attacker,blockers[i]),
                    addRemovedDice(removedDice,blockers[i].dice),
                    enableToPass(),
                    depth
                )
            });
        }
        return actions;
    }

    function activePass(player,gameTable,removedDice,wasPassed,depth){
        return makePhase(
            nextPlayer(player),
            makeSuppliedGameTable(player,gameTable,removedDice),
            wasPassed,
            depth
        );
    }

    function gameOver(gameTable){
        return {
            actType : 'game over',
            result  : countDomain(gameTable)
        };
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

    function attack(action){
        for(var i = 0; i < action.length; i++){
            if(action[i].actType == 'attack'){
                clealyAttacker(action[i].x,action[i].y);
                enableToSelectAttacker(action[i].x,action[i].y,action[i].next);
            }
        }
    }

    function enableToSelectAttacker(x,y,blockers){
        var isAttacking = false;
        $('#'+ x + y).on('click',function(){
            if(!isAttacking){
                for(var i = 0; i < blockers.length; i++){
                    clealyBlocker(blockers[i].x,blockers[i].y);
                }
                isAttacking = true;
            }else{
                cancelAttack(blockers);
                isAttacking = false;
            }
        });
    }

    function clealyAttacker(x,y){
        $('#'+ x + y).css({
            'background-color' : 'yellow'
        });
    }

    function clealyBlocker(x,y){
        $('#'+ x + y).css({
            'background-color' : 'red'
        });
    }

    function cancelAttack(blockers){
        for(var i = 0; i < blockers.length; i++){
            $('#'+ blockers[i].x + blockers[i].y).css({
                'background-color' : 'white'
            });
        }
    }
});
