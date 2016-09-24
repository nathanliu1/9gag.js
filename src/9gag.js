var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

// Constants
const SUCCESS = 200;
const NOT_FOUND = 404;

// Core Object
var _9gag = {
    getPost: function(gagId, callback) {
        var site = 'http://9gag.com/gag/' + gagId;
        
        request(site, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(body);

                var gagData = {};
                gagData['id'] = gagId;
                gagData['image'] = 'http://img-9gag-fun.9cache.com/photo/' + gagId + '_700b.jpg';
                gagData['title'] = $('.badge-item-title').html();
                callback(gagData);
            } else {
                callback(undefined);
            }
        });
    }
}

// Beginning of API
app.get('/gag/:gagId', function(req, res) {
    if (req.params.gagId.length != 7) {
        res.json({'status': NOT_FOUND, message: 'GAG NOT FOUND'});
    }

    var response = {};
    var data = [];

    _9gag.getPost(req.params.gagId, function(postData) {
        // Handle unknown gag
        if (!postData) {
            response['status'] = NOT_FOUND;
            response['message'] = 'GAG NOT FOUND';
            res.json(response);
        }
        response['status'] = SUCCESS;
        response['message'] = 'OK'

        data.push(postData);
        response['data'] = data;

        res.json(response);
    });
})

app.get('*', function(req, res) {
    res.json({'status': NOT_FOUND, message: 'SITE NOT FOUND'});
});

app.listen(3000)