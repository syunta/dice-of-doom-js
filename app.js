$(function(){
    
    var TABLE_SIZE = 2;
    var TABLE_ROW = ['A','B','C','D'];
    var TABLE_COLUMN = [1,2,3,4];
    
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

    startApp();

    function startApp(){
        drawGameTable();
        setInitialGameTable(gameTable);
        console.log(gameTable['A1']);
        console.log(gameTable['A2']);
        console.log(gameTable['B1']);
        console.log(gameTable['B2']);
    }

    function drawGameTable(){
        var tableFrame = '';
        var space = '&nbsp;&nbsp;';

        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = TABLE_SIZE; i < j; j--){
                tableFrame += space;
            }
            for(var j = 0; j < TABLE_SIZE; j++ ){
                tableFrame += TABLE_ROW[i] + (j+1) + space;
            }

            tableFrame += '</br>';
        }
        $("body").html(tableFrame);
    }

    function setInitialGameTable(gameTable){
        var players = ['A','B'];
        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = 0; j < TABLE_SIZE; j++){
                gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].owner = players[getRandom(0,1)];
                gameTable[ TABLE_ROW[i]+TABLE_COLUMN[j] ].dice = getRandom(1,3);
            }
        }
    }

    function getRandom(min,max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});
