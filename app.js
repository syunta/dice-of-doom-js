$(function(){
    
    var TABLE_SIZE = 2;
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
        console.log( makeGameTree() );
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
        var depth = 3; // debugging code

        return makePhase(player,currentGameTable,depth);
    }

    function makePhase(player,gameTable,depth){
        return {
            player            : player,
            startingGameTable : gameTable,
            actions           : makePhaseAction(player,gameTable,depth)
        };
    }

    function makePhaseAction(player,gameTable,depth){
        return {
            gameTable      : gameTable,
            nextActions    : listPossibleActions(player,gameTable,depth)
        };
    }
    
    function listPossibleActions(player,gameTable,depth){
        if(depth != 0){
            depth -= 1;
            return makePhase(nextPlayer(player),gameTable,depth);
        }else{
            return null;
        }
    }

    function nextPlayer(player){
        return TURN[player].next;
    }

    function setInitialGameTable(gameTable){
        var players = ['A','B'];
        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = 0; j < TABLE_SIZE; j++){
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

        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = TABLE_SIZE; i < j; j--){
                tableFrame += space;
            }
            for(var j = 0; j < TABLE_SIZE; j++ ){
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
