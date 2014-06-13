//
// Serve up the main 3sketch page.
//
var http = require('http'),
    express = require('express'),
    mongojs = require('mongojs'),
    crypto = require('crypto');


var DB_USER = process.env.DB_USER || process.argv[2],
    DB_PWORD = process.env.DB_PWORD || process.argv[3];


var app = express();
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/client'));     // serve static files from the /client directory


function randomChrs(howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = [ howMany ]
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}

// DB stuff - move this and the db routes to separate file soon
var uri = "mongodb://" + DB_USER + ":" + DB_PWORD + "@ds029658.mongolab.com:29658/3sketch1",
    db = mongojs.connect( uri, ["sketches_1"] );

// The main 'home' route
app.get('/', function( req, res ) {
    res.render('home', { params: [
        { name: "width", min: 1, max: 20, step: 1, value: 10 },
        { name: "height", min: 1, max: 20, step: 1, value: 10 },
    ], functext: "// Return a single THREE.Geomtry object\n\nreturn new THREE.BoxGeometry( width, 10, height )"})
});

// The route for loading a specific saved sketch
app.get('/:sketchId', function( req, res ) {
    if (( req.params.sketchId === 'examples' ) ||  
        ( req.params.sketchId === 'about' )
        ) {
            res.send("Implement me!");
            return;
        }
    db.sketches_1.find({"sketch_id": req.params.sketchId}, function(err, records) {
        if (err) {
            console.log("There was an error with the database query");
            res.end();
        } else {
            var jsCode = record[0].functext; //new Buffer( record[0].functext_b64, 'base64' ).toString().replace(/\n/g, "\\n");
            res.render('home', { params: record[0].params, functext: jsCode });
        }
    })
})

// The route for saving a new sketch
app.post('/new', function( req, res ) {
    // TODO Implement me!
    var params = req.body.geo_params,
        jsCode = req.body.js_code;
    var newSketchId = "s" + randomChrs(8); // TODO Actually check for collisions
    db.sketches_1.insert({
        sketch_id: newSketchId,
        parms: params,
        functext: jsCode
    }, function(err,doc) {
        if (err) {
            res.send("error! --> " + err.toString() );
        } else {
            res.send('{"status": "success", "sketchId": "' + newSketchId +'" }')
        }
    })
})

var server = app.listen( process.env.PORT, function() {
    console.log('listening on port ' + process.env.PORT );
});