$(function(){
    
    var TABLE_SIZE = 2;

    startApp();

    function startApp(){
        drawGameTable();
    }

    function drawGameTable(){
        var gameTable = '';
        var tableColumns = ['A','B','C','D'];
        var space = '&nbsp;&nbsp;';

        for(var i = 0; i < TABLE_SIZE; i++){
            for(var j = TABLE_SIZE; i < j; j--){
                gameTable += space;
            }
            for(var j = 0; j < TABLE_SIZE; j++ ){
                gameTable += tableColumns[i] + (i+1) + space;
            }

            gameTable += '</br>';
        }
        $("body").html(gameTable);
    }
});
