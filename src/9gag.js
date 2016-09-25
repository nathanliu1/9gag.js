'use strict';
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');

var app = express();

// HTTP status codes, messages and miscellaneous constants
const SUCCESS = 200;
const SUCCESS_MESSAGE = 'OK';
const BAD_REQUEST = 400;
const BAD_REQUEST_MESSAGE = 'UNKNOWN REQUEST KEYWORD';
const NOT_FOUND = 404;
const NOT_FOUND_MESSAGE = 'RESOURSE NOT FOUND';
const SECTION_LIST = ['hot', 'trending', 'fresh', 'funny', 'wtf', 'gif', 'nsfw', 'gaming', 'anime-manga', 'movie-tv', 'cute', 'girl', 'awesome', 'cosplay', 'sport', 'food', 'ask9gag', 'timely']
const SPECIAL_SECTION_LIST = ['hot', 'trending', 'fresh']

// Core 9GAG API Object
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
                response['message'] = SUCCESS_MESSAGE;
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

// Util Object
var _util = {
    baseContentUrl: 'http://img-9gag-fun.9cache.com/photo/',
    generateImagesUrl: function(gagId) {
        var imagesUrl = {};
        imagesUrl['small'] = this.baseContentUrl + gagId + '_220x145.jpg';
        imagesUrl['cover'] = this.baseContentUrl + gagId + '_460c.jpg';
        imagesUrl['normal'] = this.baseContentUrl + gagId + '_460s.jpg';
        imagesUrl['large'] = this.baseContentUrl + gagId + '_700b.jpg';
        return imagesUrl;
    },
    generateMediaUrl: function(gagId) {
        var mediaUrl = {};
        mediaUrl['mp4'] = this.baseContentUrl + gagId + '_460sv.mp4';
        mediaUrl['webm'] = this.baseContentUrl + gagId + '_460svwm.webm';
        return mediaUrl;
    },
    isSectionValid: function(req) {
        // 1. Check if the requested section is a valid section
        // 2. Check if the requested section is in SPECIAL_SECTION_LIST ['hot', 'trending', 'fresh']. 
        //    if it is, make sure the user did not provide a subSection
        // 3. Make sure subSection is only 'hot' or 'fresh'. If the user did not provide a subSection, it will be 'hot' by default
        if (!_.includes(SECTION_LIST, req.params.section)) {
            return false;
        } else if (_.includes(SPECIAL_SECTION_LIST, req.params.section) && req.params.subSection != undefined) {
            return false;
        } else if (!_.includes(SPECIAL_SECTION_LIST, req.params.section)) {
            if (req.params.subSection != undefined && req.params.subSection != 'hot' && req.params.subSection != 'fresh') {
                return false;
            }
        }
        // Checking if there is extra parameters, since we do not want extra parameters
        return !req.params['0'];
    }
};

// API STARTS HERE

// GET /gag/:gagId
app.get('/gag/:gagId', function(req, res) {
    // Gag id is invalid if the length is not 7
    if (req.params.gagId.length != 7) {
        res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
        return;
    }
    _9gag.getPost(req.params.gagId, function(response) {
        // Handle unknown gag
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        // returning a json response
        res.json(response);
    });
});

app.get('/:section/:subSection*?', function(req, res) {
    if (_util.isSectionValid(req)) {
        res.json({'status': SUCCESS, 'message': req.params.section + ' ' + req.params.subSection});
    } else {
        res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
    }
});

app.get('*', function(req, res) {
    res.json({'status': BAD_REQUEST, 'message': BAD_REQUEST_MESSAGE});
});

app.listen(3000);