//
// Serve up the main 3sketch page.
//
var http = require('http'),
    express = require('express'),
    mongojs = require('mongojs'),
    crypto = require('crypto');


var DB_USER = process.env.DB_USER || process.argv[2],
    DB_PWORD = process.env.DB_PWORD || process.argv[3],
    MAIN_ROOT = process.env.MAIN_ROOT || 'https://3sketch-c9-skewart.c9.io',
    DISPLAY_ROOT = process.env.DISPLAY_ROOT || 'https://3sketch_display-c9-skewart.c9.io';


var app = express();
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/client'));     // serve static files from the /client directory
app.use(express.bodyParser());


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
    console.log( MAIN_ROOT );
    console.log( DISPLAY_ROOT );
    res.render('home', {
    main_url: MAIN_ROOT,
    display_url: DISPLAY_ROOT + '/_display',
    params: [
        { name: "width", min: 30, max: 80, step: 1, value: 50 },
        { name: "height", min: 30, max: 80, step: 1, value: 50 },
    ], functext: new Buffer( "// Return a single THREE.Geomtry object\n\nreturn new THREE.BoxGeometry( width, height, 10 )" ).toString( 'base64' ) })
});

// The route for loading a specific saved sketch
app.get('/:sketchId', function( req, res ) {
    if ( req.params.sketchId[0] != "s"  ) {
        res.writeHead( 303, {
            "location": MAIN_ROOT
        });
        res.end();
        return;
    } 
    db.sketches_1.find({"sketch_id": req.params.sketchId}, function(err, records) {
        if (err) {
            console.log("There was an error with the database query");
            res.end();
        } else {
            if ( records.length < 1 ) {
                // TODO Return a 404 with a nice message
                res.writeHead( 303, {
                    "location": MAIN_ROOT
                })
            }
            var jsCode = new Buffer( records[0].functext).toString( 'base64' );
            res.render('home', { params: records[0].params, functext: jsCode, main_url: MAIN_ROOT, display_url: DISPLAY_ROOT + '/_display' });
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
        params: params,
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