//
// Serve up the main 3sketch page.
//
var http = require('http'),
    express = require('express');


var app = express();
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/client'));     // serve static files from the /client directory

app.get('/', function( req, res ) {
    res.render('home', { params: [
        { name: "width", min: 1, max: 20, step: 1, value: 10 },
        { name: "height", min: 1, max: 20, step: 1, value: 10 },
    ]})
});

var server = app.listen( process.env.PORT, function() {
    console.log('listening on port ' + process.env.PORT );
});