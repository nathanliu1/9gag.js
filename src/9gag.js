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
        // Use afterId as a query parameter for user-specific loadMoreId
        // Otherwise, use id as a query parameter for section-specific loadMoreId
        if (!!loadMoreId) {
            if (url.indexOf('http://9gag.com/u/') != -1) url += '?afterId=' + loadMoreId;
            else url += '?id=' + loadMoreId;
        }

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
                // 9gag used last 3 gag to determine loadMoreId
                if (data.length == 10) {
                    response['loadMoreId'] = data[9] + '%2C' +  data[8] + '%2C' + data[7];
                } else {
                    response['loadMoreId'] = '';
                }
                callback(response);
            } else {
                callback(undefined);
            }
        });
    },
    getUserOverview: function(url, userId, callback) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var $ = cheerio.load(body);

                // Construct a response
                var response = {}
                response['status'] = SUCCESS;
                response['message'] = SUCCESS_MESSAGE;
                response['userId'] = userId;
                response['profileImage'] = $('.profile-header .avatar-container img').attr('src');
                response['url'] = url;
                callback(response);
            } else {
                callback(undefined);
            }
        });
    },
    getComments: function(url, limit, callback) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var response = {}
                response['status'] = SUCCESS;
                response['message'] = SUCCESS_MESSAGE;
                var comments = [];
                var payload = JSON.parse(body).payload;
                var opUserId = payload.opUserId;
                _.each(payload.comments, function(comment, i) {
                    if (i == limit) {
                        callback(comments);
                        return;
                    }
                    var commentObj = {};
                    commentObj['commentId'] = comment.commentId;
                    commentObj['userId'] = comment.user.displayName;
                    commentObj['text'] = comment.richtext;
                    commentObj['timestamp'] = comment.timestamp;
                    if (commentObj['childrenCount'] > 0) {
                        commentObj['childrenCount'] = comment.childrenTotal
                    }
                    // Check if commenter is OP
                    if (comment.userId == opUserId) {
                        commentObj['isOp'] = true;
                    }
                    commentObj['likeCount'] = comment.likeCount;
                    comments.push(commentObj);
                    if (i == 9) response['loadMoreId'] = comment.orderKey;
                });
                response['comments'] = comments;
                callback(response);
                //callback(JSON.parse(body));
            } else {
                callback(undefined);
            }
        });
    },
    getCommentChildren: function(url, extractFirstChild, limit, callback) {
        if (extractFirstChild) {
            request(url, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    var response = {};
                    var payload = JSON.parse(body).payload;
                    var opUserId = payload.opUserId;
                    var firstChildren = payload.comments[0].children[0];
                    if (!firstChildren) callback(undefined);
                    response['commentId'] = firstChildren.commentId;
                    response['userId'] = firstChildren.user.displayName;
                    response['text'] = firstChildren.richtext;
                    if (firstChildren.userId == opUserId) {
                        response['isOp'] = true;
                    }
                    response['timestamp'] = firstChildren.timestamp;
                    response['likeCount'] = firstChildren.likeCount;
                    callback(response);
                }
            });
        } else {
            this.getComments(url, limit, function(response) {
                if (Array.isArray(response)) {
                    callback(response);
                } else {
                    callback(response.comments);
                }
            });
        }
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

app.get('/user/:userId', function(req, res) {
    var url = 'http://9gag.com/u/' + req.params.userId;
    _9gag.getUserOverview(url, req.params.userId, function(response) {
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        res.json(response);
    })
});

app.get('/user/:userId/posts', function(req, res) {
    var url = 'http://9gag.com/u/' + req.params.userId + '/posts';
    _9gag.getPosts(url, req.query.loadMoreId, function(response) {
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        response['userId'] = req.params.userId;
        res.json(response);
    })
});

app.get('/user/:userId/upvotes', function(req, res) {
    var url = 'http://9gag.com/u/' + req.params.userId + '/likes';
    _9gag.getPosts(url, req.query.loadMoreId, function(response) {
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        response['userId'] = req.params.userId;
        res.json(response);
    })
});

app.get('/comment/:gagId', function(req, res) {
    var appId = 'a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b';
    var gagUrl = encodeURIComponent('http://9gag.com/gag/' + req.params.gagId);
    // Comments are sorted by its score by default
    var section = 'score';
    if (req.query.section) {
        if (req.query.section == 'fresh') {
            section='ts'
        }
    }

    //Append loadMoreId
    var url = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=' + appId + '&url=' + gagUrl + '&count=10&level=1&order=' + section;
    if (req.query.loadMoreId) {
        url += '&ref=' + req.query.loadMoreId
    }
    url += '&origin=9gag.com';

    // A URL that retrieve the comments of a gag post in JSON format
    _9gag.getComments(url, undefined, function(response) {
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        res.json(response);
    });
});

app.get('/comment/:gagId/:commentId', function(req, res) {
    var commentId = req.params.commentId;
    var gagUrl = encodeURIComponent('http://9gag.com/gag/' + req.params.gagId);
    var commentUrl = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&url=' + gagUrl + '&count=1&level=2&order=score&mentionMapping=true&commentId=' + commentId + '&origin=9gag.com';
    if (!req.query.loadMoreId) {
        _9gag.getCommentChildren(commentUrl, true, undefined, function(firstComment) {
            var childrenUrl = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&url=' + gagUrl + '&count=10&level=2&order=score&mentionMapping=true&refCommentId=' + firstComment.commentId + '&origin=9gag.com';
            console.log(childrenUrl);
            _9gag.getCommentChildren(childrenUrl, false, 9, function(childrenComment) {
                var response = {};
                response['status'] = SUCCESS;
                response['message'] = SUCCESS_MESSAGE;
                response['parent'] = req.params.commentId;
                var comments = _.concat(firstComment, childrenComment);
                if (comments.length == 10) {
                    response['loadMoreId'] = comments[9].commentId;
                }
                response['comments'] = comments;
                res.json(response);
            });
        });
    } else {
        var childrenUrl = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&url=' + gagUrl + '&count=10&level=2&order=score&mentionMapping=true&refCommentId=' + req.query.loadMoreId + '&origin=9gag.com';
        _9gag.getCommentChildren(childrenUrl, false, 9, function(childrenComment) {
            var response = {};
            response['status'] = SUCCESS;
            response['message'] = SUCCESS_MESSAGE;
            response['parent'] = req.params.commentId;
            var comments = childrenComment;
            if (comments.length == 9) {
                response['loadMoreId'] = comments[8].commentId;
            }
            response['comments'] = comments;
            res.json(response);
        });
    }
});

app.get('*', function(req, res) {
    res.json({'status': BAD_REQUEST, 'message': BAD_REQUEST_MESSAGE});
});

app.listen(3000);
