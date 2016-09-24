var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

// Constants
const SUCCESS = 200;
const NOT_FOUND = 404;

// Core API Object
var _9gag = {
    getPost: function(gagId, callback) {
        // Base URL for a gag
        var site = 'http://9gag.com/gag/' + gagId;
        
        // Get data for the gag site
        request(site, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(body);

                var gagData = {};
                gagData['id'] = gagId;
                gagData['image'] = 'http://img-9gag-fun.9cache.com/photo/' + gagId + '_700b.jpg';
                gagData['title'] = $('.badge-item-title').html();

                // Callback
                callback(gagData);
            } else {
                // If we fail to request from gag site
                callback(undefined);
            }
        });
    }
}

// Beginning of API
app.get('/gag/:gagId', function(req, res) {
    // Gag id is invalid if the length is not 7
    if (req.params.gagId.length != 7) {
        res.json({'status': NOT_FOUND, message: 'GAG NOT FOUND: ID LENGTH IS NOT 7'});
        return;
    }

    _9gag.getPost(req.params.gagId, function(postData) {
        // Handle unknown gag
        if (!postData) {
            res.json({'status': NOT_FOUND, message: 'GAG NOT FOUND: UNKNOWN ID'});
            return;
        }

        // Successful
        var response = {};
        var data = [];

        response['status'] = SUCCESS;
        response['message'] = 'OK'

        data.push(postData);

        response['data'] = data;

        res.json(response);
    });
})

app.get('*', function(req, res) {
    res.json({'status': NOT_FOUND, message: 'API NOT FOUND'});
});

app.listen(3000)