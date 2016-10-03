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
const NOT_FOUND_MESSAGE = 'RESOURCE NOT FOUND';
const SECTION_LIST = ['hot', 'trending', 'fresh', 'funny', 'wtf', 'gif', 'nsfw', 'gaming', 'anime-manga',
                    'movie-tv', 'cute', 'girl', 'awesome', 'cosplay', 'sport', 'food', 'ask9gag', 'timely']
const SPECIAL_SECTION_LIST = ['hot', 'trending', 'fresh']

// Core 9GAG API Object
var _9gag = {
    getPost: function(url, gagId, callback) {
        // Get data for the gag site
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var $ = cheerio.load(body);

                // Construct a response
                var response = {};
                response['status'] = SUCCESS;
                response['message'] = SUCCESS_MESSAGE;
                var gag = {};
                gag['id'] = gagId;
                gag['title'] = $('.badge-item-title').html();
                gag['images'] = _util.generateImagesUrl(gagId);
                gag['next'] = $('.badge-next-post-entry').attr('href').substring(5, 12);
                // Check if the gag is a gif
                if ($('.badge-animated-cover').length > 0) {
                    gag['media'] = _util.generateMediaUrl(gagId);
                }
                gag['url'] = 'http://9gag.com/gag/' + gagId;
                gag['votes'] = parseInt($('.badge-item-love-count').html().replace(',', ''));
                gag['comments'] = parseInt($('.badge-item-comment-count').html().replace(',', ''));
                gag['share'] = _util.generateShareUrl(gagId, gag['title']);
                response['gag'] = gag;
                // Callback
                callback(response);
            } else {
                // If we fail to request from gag site
                callback(undefined);
            }
        });
    },
    getPosts: function(url, loadMoreId, callback) {
        // If there is a loadMoreId available, change the url
        if (!!loadMoreId) url += '?id=' + loadMoreId;

        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var $ = cheerio.load(body);

                // Construct a response
                var response = {}
                response['status'] = SUCCESS;
                response['message'] = SUCCESS_MESSAGE;

                // Go throught each gag on the page to get each gag id
                var data = [];
                _.each($('.badge-item-title'), function(gag, i) {
                    // Make sure number of extracted gags does not exceed the limit that the user desires
                    if (i < 10) {
                        // Get gag id from href attribute and minor string clean up
                        var gagId = cheerio.load(gag)('a').attr('href').replace('/gag/', '');
                        data.push(gagId.substring(0, 7));
                    }
                });

                response['data'] = data;
                response['loadMoreId'] = data[9] + '%2C' +  data[8] + '%2C' + data[7]
                callback(response);
            } else {
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
        } else if (_.includes(SPECIAL_SECTION_LIST, req.params.section) && req.query.subSection != undefined) {
            return false;
        } else if (!_.includes(SPECIAL_SECTION_LIST, req.params.section)) {
            if (!_.includes(['hot', 'fresh', undefined], req.query.subSection)) {
                return false;
            }
        }
        // Checking if there is extra parameters, since we do not want extra parameters
        return !req.params['0'];
    }, 
    generateShareUrl: function(gagId, title) {
        var shareUrl = {};
        var facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?u=http://9gag.com/gag/';
        var twitterBaseUrl = 'https://twitter.com/intent/tweet?via=9GAG&source=tweetbutton&original_referer=http://9gag.com/gag/';
        var googlePlusBaseUrl = 'https://plus.google.com/share?url=http://9gag.com/gag/';
        var pinterestBaseUrl = 'https://www.pinterest.com/pin/create/button/?url=http://9gag.com/gag/';
        shareUrl['facebook'] = facebookBaseUrl + gagId + '?ref=fb.s';
        shareUrl['twitter'] = twitterBaseUrl + gagId + '?ref=t&text=' + encodeURIComponent(title) + '!&url=http://9gag.com/gag/' + gagId + '?ref=t';
        shareUrl['googlePlus'] = googlePlusBaseUrl + gagId + '?ref=gp';
        shareUrl['pinterest'] = pinterestBaseUrl + gagId + '?ref=pn&media=http://img-9gag-fun.9cache.com/photo/' + gagId + '_700b.jpg&description=' + encodeURIComponent(title);
        return shareUrl;
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

    var url = 'http://9gag.com/gag/' + req.params.gagId;
    _9gag.getPost(url, req.params.gagId, function(response) {
        // Handle unknown gag
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        // returning a json response
        res.json(response);
    });
});

app.get('/:section/', function(req, res) {
    // Check if the URL is valid
    if (_util.isSectionValid(req)) {
        var url = 'http://9gag.com/' + req.params.section + '/' + (!req.query.subSection ? '' : req.query.subSection);

        _9gag.getPosts(url, req.query.loadMoreId, function(response) {
            if (!response) {
                res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
                return;
            }

            // Add section and subSection key to response
            response['section'] = req.params.section;
            if (!_.includes(SPECIAL_SECTION_LIST, req.params.section)) {
                response['subSection'] = !req.query.subSection ? 'hot' : req.query.subSection;
            }

            res.json(response);
        });
    } else {
        res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
    }
});

app.get('*', function(req, res) {
    res.json({'status': BAD_REQUEST, 'message': BAD_REQUEST_MESSAGE});
});

app.listen(3000);
