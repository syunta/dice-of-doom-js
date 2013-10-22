$(function(){
    
    var TABLE_ROW = ['A','B'];
    var TABLE_COLUMN = [1,2];
    var TURN = {
        'A':{next:'B'},
        'B':{next:'A'}
    };

    var currentGameTable = {};

    startApp();

    function startApp(){
        currentGameTable = setInitialGameTable( createGameTable() );
        drawGameTable(currentGameTable);
        console.log( JSON.stringify(makeGameTree(),null,4) );
//        console.log( makeGameTree() );
    }

    function createGameTable(){
        var gameTable = {
            'A1':{
                owner:null,
                dice:0,
                link:['A2','B1','B2']
            },
            'A2':{
                owner:null,
                dice:0,
                link:['A1','B2']
            },
            'B1':{
                owner:null,
                dice:0,
                link:['A1','B2']
            },
            'B2':{
                owner:null,
                dice:0,
                link:['A1','A2','B1']
            }
        }; 

        return gameTable;
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
        return 'test';
//        return {
//            gameTable      : gameTable,
//            nextActions    : listActions(player,gameTable,depth)
//        };
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
                            makeNextGameTable(gameTable),
                            depth
                        );
                    }
                }
            }
        }
        return attackedEnemyHexes;
    }

    function makeNextGameTable(gameTable){
        return gameTable;
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

    $(function(){
        $("body").on('click','span',function(){
            getStatus( $(this).attr('id') );
        });
    });

    function getStatus(id){
        console.log( currentGameTable[id] );
    }
});
