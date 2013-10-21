$(function(){
    
    var TABLE_SIZE = 2;
    var TABLE_ROW = ['A','B'];
    var TABLE_COLUMN = [1,2];

    var currentGameTable = {};

    startApp();

    function startApp(){
        currentGameTable = setInitialGameTable();
        drawGameTable(currentGameTable);
    }

    function drawGameTable(gameTable){
        var tableFrame = '';
        var space = '&nbsp;&nbsp;&nbsp;';

        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = TABLE_SIZE; i < j; j--){
                tableFrame += space;
            }
            for(var j = 0; j < TABLE_SIZE; j++ ){
                tableFrame += 
                    gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].owner + ':' +
                    gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].dice + space;
            }

            tableFrame += '</br>';
        }
        $("body").html(tableFrame);
    }

    function setInitialGameTable(gameTable){
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
});
