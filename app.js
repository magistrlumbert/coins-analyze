var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true});


app.get('/', function (req, res) {
    var html = '';
    html += "<body>";
    //html +="<script src="socket.min.js"></script>";
    html += "<form action='/send'  method='get' name='form1'>";
    html += "Name:</p><input type= 'text' name='name'>";
    html += "Email:</p><input type='text' name='email'>";
    html += "address:</p><input type='text' name='address'>";
    html += "Mobile number:</p><input type='text' name='mobilno'>";
    html += "<input type='submit' value='submit'>";
    html += "<INPUT type='reset'  value='reset'>";
    html += "</form>";
    html += "</body>";
    res.send(html);
});

app.get('/send', urlencodedParser, function (req, res) {
    //"apikey": "B79B64C9-2B02-463F-9C54-BB9EED788BC6",

    const https = require('https'), zlib = require('zlib');

    var options = {
        "method": "GET",
        "hostname": "rest.coinapi.io",
        "path": "/v1/ohlcv/BINANCE_SPOT_ICX_BTC/history?period_id=10MIN&time_start=2016-01-01T00:00:00.0000000Z&limit=100000",
        "headers": {'X-CoinAPI-Key': 'B79B64C9-2B02-463F-9C54-BB9EED788BC6', 'Accept': 'application/json', 'Accept-Encoding': 'deflate, gzip'}
    };

    var request = https.request(options, function (res) {
        var data = '';
        // pipe the response into the gunzip to decompress
        var gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        // A chunk of data has been recieved.
        gunzip.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        gunzip.on('end', () => {
            console.log('The whole response has been received.');

            console.log(data);
            var myobj = JSON.parse(data);
            // Send the Mongo query here
            var MongoClient = require('mongodb').MongoClient;
            var url = "mongodb://localhost:27017/";

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("coins");
                dbo.collection("Ohlcv").insertMany(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("Number of documents inserted: " + res.insertedCount);
                    db.close();
                });
            });
        });
    }).on('error', (e) => {
            console.error(e);
    });

    request.end();


});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});