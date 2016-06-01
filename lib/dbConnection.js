var mysql = require('mysql');
var connection = mysql.createConnection({

    host    : '127.0.0.1',
    user    : 'root',
    password: '3178',
    database: 'jongsuelDB'

});

connection.connect(function(err){
    if(err)
    {
        console.error('connecting Error : '+ err.stack);
        return;
    }
});

module.exports = connection;
                
