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
        request(site, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var $ = cheerio.load(body);

                // Construct a response
                var response = {};
                response['status'] = SUCCESS;
                response['message'] = 'OK';
                response['id'] = gagId;
                response['caption'] = $('.badge-item-title').html();
                response['images'] = _util.generateImagesUrl(gagId);
                // Check if the gag is a gif
                if ($('.badge-animated-cover').length > 0) {
                    response['media'] = _util.generateMediaUrl(gagId);
                }
                response['link'] = 'http://9gag.com/gag/' + gagId;
                response['votes'] = {};
                response['votes']['count'] = parseInt($('.badge-item-love-count').html().replace(',', ''));
                response['comments'] = {};
                response['comments']['count'] = parseInt($('.badge-item-comment-count').html().replace(',', ''));

                // Callback
                callback(response);
            } else {
                // If we fail to request from gag site
                callback(undefined);
            }
        });
    }
};

// Helper Object
var _util = {
    generateImagesUrl: function(gagId) {
        const BASE_URL = 'http://img-9gag-fun.9cache.com/photo/';
        var imagesUrl = {};
        imagesUrl['small'] = BASE_URL + gagId + '_220x145.jpg';
        imagesUrl['cover'] = BASE_URL + gagId + '_460c.jpg';
        imagesUrl['normal'] = BASE_URL + gagId + '_460s.jpg';
        imagesUrl['large'] = BASE_URL + gagId + '_700b.jpg';
        return imagesUrl;
    },
    generateMediaUrl: function(gagId) {
        const BASE_URL = 'http://img-9gag-fun.9cache.com/photo/';
        var mediaUrl = {};
        mediaUrl['mp4'] = BASE_URL + gagId + '_460sv.mp4';
        mediaUrl['webm'] = BASE_URL + gagId + '_460svwm.webm';
        return mediaUrl;
    }
};

// Beginning of API
app.get('/gag/:gagId', function(req, res) {
    // Gag id is invalid if the length is not 7
    if (req.params.gagId.length != 7) {
        res.json({'status': NOT_FOUND, message: 'GAG NOT FOUND: ID LENGTH IS NOT 7'});
        return;
    }
    
    _9gag.getPost(req.params.gagId, function(response) {
        // Handle unknown gag
        if (!response) {
            res.json({'status': NOT_FOUND, message: 'GAG NOT FOUND: UNKNOWN ID'});
            return;
        }

        // returning a json
        res.json(response);
    });
});

app.get('*', function(req, res) {
    res.json({'status': NOT_FOUND, message: 'API NOT FOUND'});
});

app.listen(3000);