/////////////////////////////////////////////
//  ___                       _            //
// / _ \  __ _  __ _  __ _   (_)___        //
//| (_) |/ _` |/ _` |/ _` |  | / __|       //
// \__, | (_| | (_| | (_| |_ | \__ \       //
//   /_/ \__, |\__,_|\__, (_)/ |___/       //
//       |___/       |___/ |__/            //
//Author: @chewong, @JasonFok, @nathanliu1 // 
/////////////////////////////////////////////
'use strict';
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var _       = require('lodash');

var app = express();
var cache = require('express-redis-cache')();

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

// Core 9GAG API Helper Object
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
    getComments: function(url, callback) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var response = {}
                response['status'] = SUCCESS;
                response['message'] = SUCCESS_MESSAGE;
                var comments = [];
                var payload = JSON.parse(body).payload;
                _.each(payload.comments, function(comment, i) {
                    comments.push(_util.processComment(comment, payload.opUserId));
                    if (i == 9) response['loadMoreId'] = comment.orderKey;
                });
                response['comments'] = comments;

                // Use refCommentId to load more children of a comment
                if (payload.hasOwnProperty('refCommentId')) {
                    response['loadMoreId'] = payload['refCommentId'];
                }
                callback(response);
            } else {
                callback(undefined);
            }
        });
    }
};

// Utility Object
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
    },
    processComment: function(comment, opUserId) {
        var commentObj = {};
        commentObj['commentId'] = comment.commentId;
        commentObj['userId'] = comment.user.displayName;
        commentObj['text'] = unescape(comment.text);
        if (comment.userId == opUserId) {
            commentObj['isOp'] = true;
        } else {
            commentObj['isOp'] = false;
        }
        if (comment.level == 1) {
            commentObj['isChild'] = false;
            commentObj['childrenCount'] = comment.childrenTotal;
        } else {
            commentObj['isChild'] = true;
        }
        commentObj['timestamp'] = comment.timestamp;
        commentObj['likeCount'] = comment.likeCount;
        return commentObj
    },
    getFirstCommentChild: function(url, callback) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                // Get the first child of the comment so we can use the firstCommentId to extract other children comment
                var payload = JSON.parse(body).payload;
                if (!payload || !(payload.comments[0])) {
                    callback(undefined);
                    return;
                }
                var opUserId = payload.opUserId;
                var firstChild = payload.comments[0].children[0];
                callback(_util.processComment(firstChild, opUserId));
            } else {
                callback(undefined);
            }
        });
    }
};

///////////////////////////
// API ROUTE STARTS HERE //
///////////////////////////

/**
 * Get data for a specific gag.
 *
 * @param gagId - the id of the gag
 */
app.get('/gag/:gagId', cache.route({ expire: 60*60*24  }), function(req, res) {
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

/**
 * Get 10 gags from a particular section and sub-section
 *
 * @param section - the section of the gag
 * @query subSection - the sub-section of the gag
 * @query loadMoreId - an id that allows user to load the next 10 gags from a particular section and sub-section
 */
app.get('/:section/', cache.route({ expire: 60*60*24  }), function(req, res) {
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

/**
 * Get the overview of a user
 *
 * @param userId - the userId of the user
 */
app.get('/user/:userId', cache.route({ expire: 60*60*24  }), function(req, res) {
    var url = 'http://9gag.com/u/' + req.params.userId;
    _9gag.getUserOverview(url, req.params.userId, function(response) {
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        res.json(response);
    })
});

/**
 * Get the posts of a user
 *
 * @param userId - the userId of the user
 * @query loadMoreId - an id that allows user to load the next 10 posts that the user posted
 */
app.get('/user/:userId/posts', cache.route({ expire: 60*60*24  }), function(req, res) {
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

/**
 * Get the posts that the user upvoted
 *
 * @param userId - the userId of the user
 * @query loadMoreId - an id that allows user to load the next 10 gags that the user upvoted
 */
app.get('/user/:userId/upvotes', cache.route({ expire: 60*60*24  }), function(req, res) {
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

/**
 * Get the comments of a gag
 *
 * @param gagId - the id of the gag
 * @query loadMoreId - an id that allows user to load the next 10 comments of the gag
 * @query section - the section of the comments (can be hot or fresh)
 */
app.get('/comment/:gagId', cache.route({ expire: 60*60*24  }), function(req, res) {
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
    var url = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=' + appId + '&url=' + gagUrl + '&count=10&level=2&order=' + section;
    if (req.query.loadMoreId) {
        url += '&ref=' + req.query.loadMoreId
    }

    // A URL that retrieve the comments of a gag post in JSON format
    _9gag.getComments(url, function(response) {
        if (!response) {
            res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
            return;
        }
        res.json(response);
    });
});

/**
 * Get the comments of a gag
 *
 * @param gagId - the id of the gag
 * @param commentId - the id of the comment
 * @query loadMoreId - an id that allows user to load the next 10 comments of the gag
 */
app.get('/comment/:gagId/:commentId', cache.route({ expire: 60*60*24  }), function(req, res) {
    var appId = 'a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b';
    var gagUrl = encodeURIComponent('http://9gag.com/gag/' + req.params.gagId);

    // If there is no loadMoreId, we need to find the id of the first child of the comment
    // We need to use that id to find the rest of the comment children
    // Otherwise, use the loadMoreId to load more comments
    if (!req.query.loadMoreId) {
        var url = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=' + appId + '&url=' + gagUrl + '&count=0&level=2&commentId=' + req.params.commentId;
        _util.getFirstCommentChild(url, function(firstChildCommentObj) {
            if (!firstChildCommentObj) {
                res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
                return;
            }
            // Get the rest of the comment children using the firstChildCommentId
            var commentUrl = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=' + appId + '&url=' + gagUrl + '&count=10&level=1&refCommentId=' + firstChildCommentObj.commentId;
            _9gag.getComments(commentUrl, function(response) {
                if (!response) {
                    res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
                    return;
                }
                // concatenate firstChildComment with the rest of the child comments
                response['comments'] = _.concat(firstChildCommentObj, response['comments']);
                response['parent'] = req.params.commentId;
                res.json(response);
            });
        });
    } else {
        var commentUrl = 'http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=' + appId + '&url=' + gagUrl + '&count=10&level=1&refCommentId=' + req.query.loadMoreId;
        _9gag.getComments(commentUrl, function(response) {
            if (!response) {
                res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
                return;
            }
            response['parent'] = req.params.commentId;
            res.json(response);
        });
    }
});

/**
 * Unknown requests will be routed to here
 */
app.get('*', function(req, res) {
    res.json({'status': BAD_REQUEST, 'message': BAD_REQUEST_MESSAGE});
});

app.listen(3000);
