$(function(){

    var TABLE_SIZE = 3;
    var TURN = {A:{next:'B'},B:{next:'A'}};
    var LIMIT_VALUE_DICE_NUMBERS= 3;

    var currentGameTree = {};

    var cache = {};

    startApp();

    function test(gameTree){
        console.log(JSON.stringify(gameTree,true,2));
    }

    function startApp(){
        currentGameTree = makeGameTree('A',setInitialGameTable(createGameTable()));
        nextGameSituation(currentGameTree);

//        test(cache);
    }

    /* Data Structure*/
    function createGameTable(){
        var gameTable = [];
        for(var x = 0; x < TABLE_SIZE; x++){
            gameTable[x] = [];
        }
        for(var y = 0; y < TABLE_SIZE; y++){
            for(var x = 0; x < TABLE_SIZE; x++){
                gameTable[x][y] = {
                    x     : x,
                    y     : y,
                    owner : null,
                    dice  : 0
                };
            }
        }
        return gameTable;
    }

    function getLinkedHexes(gameTable,x,y){
        var linkedHexes = 
            getUpwardHexes(gameTable,x,y).concat(
            getHorizontalHexes(gameTable,x,y),
            getDownwardHexes(gameTable,x,y)
        );
        return linkedHexes;
    }

    function getUpwardHexes(gameTable,x,y){
        var upwardHexes = [];
        if(y != 0){
            upwardHexes.push(gameTable[x][y-1]);
            if(x != 0){
                upwardHexes.push(gameTable[x-1][y-1]);
            }
        }
        return upwardHexes;
    }

    function getHorizontalHexes(gameTable,x,y){
        var horizontalHexes = [];
        if(x != 0){
            horizontalHexes.push(gameTable[x-1][y]);
        }
        if(x != TABLE_SIZE-1){
            horizontalHexes.push(gameTable[x+1][y]);
        }
        return horizontalHexes;
    }

    function getDownwardHexes(gameTable,x,y){
        var downwardHexes =[];
        if(y != TABLE_SIZE-1){
            downwardHexes.push(gameTable[x][y+1]);
            if(x != TABLE_SIZE-1){
                downwardHexes.push(gameTable[x+1][y+1]);
            }
        }
        return downwardHexes;
    }

    /* Game Engine */
    function setInitialGameTable(gameTable){
        var players = ['A','B'];
        for(var y = 0; y < TABLE_SIZE; y++){
            for(var x = 0; x < TABLE_SIZE; x++){
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
        for(var y = 0; y < TABLE_SIZE; y++){
            for(var x = 0; x < TABLE_SIZE; x++){
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
        for(var y = 0; y < TABLE_SIZE; y++){
            for(var x = 0; x < TABLE_SIZE; x++){
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
        for(var y = 0; y < TABLE_SIZE; y++){
            for(var x = 0; x < TABLE_SIZE; x++){
                result[gameTable[x][y].owner] += 1;
            }
        }
        return result;
    }

    function addRemovedDice(removedDice,additionalDice){
        return removedDice + additionalDice;
    }

    function calculateConclusiveScore(gameTable){
        var scoreType = {
            AIwin : 1,
            draw  : 0.5,
            AIlose: 0.0
        };
        var score;
        var result = countDomain(gameTable);
        if(result.A < result.B){
            score = scoreType.AIwin;
        }else if(result.B == result.A){
            score = scoreType.draw;
        }else{
            score = scoreType.AIlose;
        }
        return score;
    }

    function calculateOpposingScore(action){
        for(var i = 0; i < action.next.action.length; i++){
            action.score += action.next.action[i].score;
        }
        return action;
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
                    player    : player,
                    gameTable : gameTable,
                    action    : [calculateOpposingScore({
                        actType : 'no action',
                        score   : 0,
                        next    : makePhase(nextPlayer(player),gameTable,forciblyPass(),depth)
                    })]
                };
            }else{
                return {
                    player    : player,
                    gameTable : gameTable,
                    action    : [gameOver(gameTable)]
                };
            }
        }
    }

    function makeActionsTree(player,gameTable,wasPassed,depth){
        var removedDice = 0;
        var canPass = false;
        return makePhaseActions(player,gameTable,removedDice,canPass,wasPassed,depth);
    }

    function makePhaseActions(player,gameTable,removedDice,canPass,wasPassed,depth){
        var key = generateCacheKey(player,gameTable,removedDice,canPass,wasPassed,depth);
        if(!cache[key]){
            cache[key] = {
                player    : player,
                gameTable : gameTable,
                action    : listActions(player,gameTable,removedDice,canPass,wasPassed,depth)
            };
        }
        return cache[key];
    }

    function generateCacheKey(player,gameTable,removedDice,canPass,wasPassed,depth){
        var stringGameTable = '';
        for(x = 0; x < TABLE_SIZE; x++){
            for(y = 0; y < TABLE_SIZE; y++){
                stringGameTable += gameTable[x][y].x;
                stringGameTable += gameTable[x][y].y;
                stringGameTable += gameTable[x][y].owner;
                stringGameTable += gameTable[x][y].dice;
            }
        }
        var key = player + stringGameTable + removedDice + canPass + wasPassed + depth;
        return key;
    }

    function listActions(player,gameTable,removedDice,canPass,wasPassed,depth){
        var actions = [];
        var attackers = listAttackers(player,gameTable);

        for(var i = 0; i < attackers.length; i++){
            actions.push(
                calculateOpposingScore({
                    actType : 'attack',
                    x       : attackers[i].x,
                    y       : attackers[i].y,
                    score   : 0,
                    next    : listBlockerSelections(
                        player,
                        gameTable,
                        removedDice,
                        attackers[i],
                        canPass,
                        wasPassed,
                        depth
                    )
                })
            );
        }
        return considerPassAction(actions,player,gameTable,removedDice,canPass,wasPassed,depth);
    }

    function considerPassAction(actions,player,gameTable,removedDice,canPass,wasPassed,depth){
        if(actions.length == 0 || canPass){
            actions.push(
                calculateOpposingScore({
                    actType : 'pass',
                    score   : 0,
                    next    : activePass(
                        player,
                        gameTable,
                        removedDice,
                        wasPassed,
                        depth
                    )
                })
            );
            return actions;
        }else{
            return actions;
        }
    }

    function listBlockerSelections(player,gameTable,removedDice,attacker,canPass,wasPassed,depth){
        var blockerSelections = [];
        var blockers = listBlockersAgainstOneAttacker(player,gameTable,attacker);
        for(var i = 0; i < blockers.length; i++){
            blockerSelections.push(
                calculateOpposingScore({
                    actType : 'block',
                    x       : blockers[i].x,
                    y       : blockers[i].y,
                    score   : 0,
                    next    : makePhaseActions(
                        player,
                        makeAttackedGameTable(player,gameTable,attacker,blockers[i]),
                        addRemovedDice(removedDice,blockers[i].dice),
                        enableToPass(),
                        wasPassed,
                        depth
                    )
                })
            );
        }
        return {
            player    : player,
            gameTable : gameTable,
            action    : blockerSelections
        };
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
            result  : countDomain(gameTable),
            score   : calculateConclusiveScore(gameTable)
        };
    }

    /* UI */
    function drawGameTable(gameTable){
        var tableFrame = '';
        var space = '&nbsp;&nbsp;&nbsp;';

        for(var y = 0; y < TABLE_SIZE; y++){
            for(var i = TABLE_SIZE; y < i; i--){
                tableFrame += space;
            }
            for(var x = 0; x < TABLE_SIZE; x++ ){
                tableFrame += 
                    '<span id = ' + x + y + '>' +
                    gameTable[x][y].owner + ':' +
                    gameTable[x][y].dice +
                    '</span>' + space;
            }
            tableFrame += '</br>';
        }
        $("#gameTable").html(tableFrame);
    }

    function drawCurrentPlayer(player){    
        $("#player").text('player : ' + player);
    }

    function clealyAttacker(action){
        for(var i = 0; i < action.length; i++){
            if(action[i].actType == 'attack'){
                $('#' + action[i].x + action[i].y).addClass('possibleAttack');
            }
        }
    }

    $('#gameTable').on('click','.possibleAttack',function(){
        var position = convertToPositionFromId( $(this) );
        for(var i = 0; i < currentGameTree.action.length; i++){
            if(currentGameTree.action[i].x == position.x && currentGameTree.action[i].y == position.y){
            var nextGameTree = currentGameTree.action[i].next;
                if( !$('#gameTable').children().hasClass('isAttacking') ){
                    $('#' + position.x + position.y).addClass('isAttacking');
                    for(var j = 0; j < nextGameTree.action.length; j++){
                        $('#' + nextGameTree.action[j].x + nextGameTree.action[j].y).addClass('possibleBlock');
                    }
                }
            }
        }
    }).on('click','.isAttacking',function(){
        var position = convertToPositionFromId( $(this) );
        $('#' + position.x + position.y).removeClass('isAttacking');
        for(var i = 0; i < currentGameTree.action.length; i++){
            if(currentGameTree.action[i].x == position.x && currentGameTree.action[i].y == position.y){
                var nextGameTree = currentGameTree.action[i].next;
                for(var j = 0; j < nextGameTree.action.length; j++){
                    $('#' + nextGameTree.action[j].x + nextGameTree.action[j].y).removeClass('possibleBlock');
                }
            }
        }
    }).on('click','.possibleBlock',function(){
        var attacker = convertToPositionFromId( $('.isAttacking') );
        var blocker = convertToPositionFromId( $(this) );

        var nextGameTree ={};
        for(var i = 0; i < currentGameTree.action.length;i++){
            if(currentGameTree.action[i].x == attacker.x && currentGameTree.action[i].y == attacker.y){
                nextGameTree = currentGameTree.action[i].next;
                break;
            }
        }

        for(var i = 0; i < nextGameTree.action.length; i++){
            if(nextGameTree.action[i].x == blocker.x && nextGameTree.action[i].y == blocker.y){
                currentGameTree = nextGameTree.action[i].next;
                break;
            }
        }
        nextGameSituation(currentGameTree);
    });

    function convertToPositionFromId($obj){
        var id = $obj.attr('id');
        var position = {};
        position.x = id.charAt(0);
        position.y = id.charAt(1);
        return position;
    }

    $('#pass').on('click',function(){
        var lastIndex = currentGameTree.action.length-1;
        var actType = currentGameTree.action[lastIndex].actType;

        if(actType == 'pass' || actType == 'no action'){
            currentGameTree = currentGameTree.action[lastIndex].next;
            nextGameSituation(currentGameTree);
        }else if(actType == 'game over'){
            showResult(currentGameTree);
        }else{
            showIllegalMessage();
        }
    });

    function showResult(gameTree){
        $('#message').fadeIn();
        $('#message').text('A:'+gameTree.action[0].result.A+'\nB:'+gameTree.action[0].result.B);
    }

    function showIllegalMessage(){
        $('#message').fadeIn();
        $('#message').text('it is impossible.');
        $('#message').fadeOut();
    }

    /* AI */
    function nextGameSituation(gameTree){
        currentGameTree = gameTree;
        if(gameTree.player == 'A'){
            setUpUI(gameTree);
        }else{
            setUpUI(gameTree);
            nextActionOfAI(gameTree);        
        }
    }

    function setUpUI(gameTree){
        drawGameTable(gameTree.gameTable);
        drawCurrentPlayer(gameTree.player);
        clealyAttacker(gameTree.action);
    }

    function nextActionOfAI(gameTree){
        var selectedAction = selectBestActionOfAI(gameTree);
        if(selectedAction.actType != 'game over'){
            setTimeout(function(){nextGameSituation(selectedAction.next);},400);
        }else{
            showResult(gameTree);
        }
    }

	function selectBestActionOfAI(gameTree){
		var scores = gameTree.action.map(function(action){ return action.score; });
		var bestScore = Math.max.apply({},scores);

		var bestAction;
		for(var i = 0; i < gameTree.action.length; i++){
			if(gameTree.action[i].score == bestScore){
				bestAction = gameTree.action[i];
				break;
			}
		}
		return bestAction;
	}
});
