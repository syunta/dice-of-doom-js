$(function(){
    
    var TABLE_SIZE = 2;
    
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
        console.log(gameTable['A1']);
        console.log(gameTable['B1']);
    }

    function drawGameTable(){
        var tableFrame = '';
        var tableColumns = ['A','B','C','D'];
        var space = '&nbsp;&nbsp;';

        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = TABLE_SIZE; i < j; j--){
                tableFrame += space;
            }
            for(var j = 0; j < TABLE_SIZE; j++ ){
                tableFrame += tableColumns[i] + (j+1) + space;
            }

            tableFrame += '</br>';
        }
        $("body").html(tableFrame);
    }

    function getRandom(min,max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});
