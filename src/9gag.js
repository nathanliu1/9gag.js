/////////////////////////////////////////////
//  ___                       _            //
// / _ \  __ _  __ _  __ _   (_)___        //
//| (_) |/ _` |/ _` |/ _` |  | / __|       //
// \__, | (_| | (_| | (_| |_ | \__ \       //
//   /_/ \__, |\__,_|\__, (_)/ |___/       //
//       |___/       |___/ |__/            //
//Author: @chewong, @JasonFok, @nathanliu1 // 
/////////////////////////////////////////////
import express from 'express';
import request from 'request';
import cheerio from 'cheerio';
import sha1    from 'sha1';
import path    from "path";
import _       from 'lodash';

const app = express();

// Load static files
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// Redis Cache Setup
const cache = require('express-redis-cache')({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  auth_pass: process.env.REDIS_PASSWORD || '',
});

// Set up server port
app.set('port', (process.env.PORT || 3000));

// HTTP status codes, messages and miscellaneous constants
const SUCCESS = 200;
const SUCCESS_MESSAGE = 'OK';
const BAD_REQUEST = 400;
const BAD_REQUEST_MESSAGE = 'UNKNOWN REQUEST KEYWORD';
const NOT_FOUND = 404;
const NOT_FOUND_MESSAGE = 'RESOURCE NOT FOUND';
const SECTION_LIST = ['hot', 'trending', 'fresh', 'funny', 'wtf', 'gif', 'nsfw', 'gaming', 'anime-manga',
          'movie-tv', 'cute', 'girl', 'awesome', 'cosplay', 'sport', 'food', 'ask9gag', 'timely'];
const SPECIAL_SECTION_LIST = ['hot', 'trending', 'fresh'];

const hashMap = {};

// Core 9GAG API Helper Object
const _9gag = {
  async getPost(url, gagId) {
    const body = await _util.getBodyFromUrl(url);
    const $ = cheerio.load(body);

    // Construct a response
    const response = {};
    response.status = SUCCESS;
    response.message = SUCCESS_MESSAGE;
    const gag = {};
    gag.id = gagId;
    gag.title = $('.badge-item-title').html();
    gag.images = _util.generateImagesUrl(gagId);
    gag.next = $('.badge-next-post-entry').attr('href').substring(5, 12);
    // Check if the gag is a gif
    if ($('.badge-animated-cover').length > 0) {
      gag.media = _util.generateMediaUrl(gagId);
    }
    gag.url = `http://9gag.com/gag/${gagId}`
    gag.votes = parseInt($('.badge-item-love-count').html().replace(',', ''));
    gag.comments = parseInt($('.badge-item-comment-count').html().replace(',', ''));
    gag.share = _util.generateShareUrl(gagId, gag.title);
    response.gag = gag;

    return response;
  },
  async getPosts(url, loadMoreId) {
    // If there is a loadMoreId available, change the url
    // Use afterId as a query parameter for user-specific loadMoreId
    // Otherwise, use id as a query parameter for section-specific loadMoreId
    loadMoreId = _util.getValueInHashmap(loadMoreId);
    if (!!loadMoreId) {
      if (url.includes('http://9gag.com/u/')) url += `?afterId=${loadMoreId}`;
      else url += `?id=${loadMoreId}`;
    }

    const body = await _util.getBodyFromUrl(url);
    const $ = cheerio.load(body);

    // Construct a response
    const response = {};
    response.status = SUCCESS;
    response.message = SUCCESS_MESSAGE;

    // Go throught each gag on the page to get each gag id
    const data = [];
    _.each($('.badge-item-title'), (gag, i) => {
      // Make sure number of extracted gags does not exceed the limit that the user desires
      if (i < 10) {
        // Get gag id from href attribute and minor string clean up
        const gagId = cheerio.load(gag)('a').attr('href').replace('/gag/', '');
        data.push(gagId.substring(0, 7));
      }
    })
    response.data = data;
    // 9gag used last 3 gag to determine loadMoreId
    if (data.length == 10) {
      response.loadMoreId = _util.generateHash(`${data[9]}%2C${data[8]}%2C${data[7]}`);
    } else {
      response.loadMoreId = '';
    }

    return response;
  },
  async getUserOverview(url, userId) {
    const body = await _util.getBodyFromUrl(url);
    const $ = cheerio.load(body);

    // Construct a response
    const response = {};
    response.status = SUCCESS;
    response.message = SUCCESS_MESSAGE;
    response.userId = userId;
    response.profileImage = $('.profile-header .avatar-container img').attr('src');
    response.url = url;
    return response;
  },
  async getComments(url) {
    const body = await _util.getBodyFromUrl(url);
    const response = {};
    response.status = SUCCESS;
    response.message = SUCCESS_MESSAGE;
    const comments = [];
    const payload = JSON.parse(body).payload;
    _.each(payload.comments, (comment, i) => {
      comments.push(_util.processComment(comment, payload.opUserId));
      if (i == 9) response.loadMoreId = _util.generateHash(comment.orderKey);
    })
    response.comments = comments;

    // Use refCommentId to load more children of a comment
    if (!('loadMoreId' in response) && payload.hasOwnProperty('refCommentId') && comments.length != 0) {
      response.loadMoreId = _util.generateHash(payload.refCommentId);
    } else if (!('loadMoreId' in response)) {
      response.loadMoreId = '';
    }
    return response;
  },
};

// Utility Object
const _util = {
  baseContentUrl: 'http://img-9gag-fun.9cache.com/photo/',
  generateImagesUrl(gagId) {
    const imagesUrl = {}
    imagesUrl.small = `${this.baseContentUrl + gagId}_220x145.jpg`
    imagesUrl.cover = `${this.baseContentUrl + gagId}_460c.jpg`
    imagesUrl.normal = `${this.baseContentUrl + gagId}_460s.jpg`
    imagesUrl.large = `${this.baseContentUrl + gagId}_700b.jpg`
    return imagesUrl
  },
  generateMediaUrl(gagId) {
    const mediaUrl = {}
    mediaUrl.mp4 = `${this.baseContentUrl + gagId}_460sv.mp4`
    mediaUrl.webm = `${this.baseContentUrl + gagId}_460svwm.webm`
    return mediaUrl
  },
  isSectionValid(req) {
    // 1. Check if the requested section is a valid section
    // 2. Check if the requested section is in SPECIAL_SECTION_LIST .hot', 'trending', 'fresh.
    //    if it is, make sure the user did not provide a subSection
    // 3. Make sure subSection is only 'hot' or 'fresh'. If the user did not provide a subSection, it will be 'hot' by default
    if (!_.includes(SECTION_LIST, req.params.section)) {
      return false
    } else if (_.includes(SPECIAL_SECTION_LIST, req.params.section) && req.query.subSection != undefined) {
      return false
    } else if (!_.includes(SPECIAL_SECTION_LIST, req.params.section)) {
      if (!_.includes(['hot', 'fresh', undefined], req.query.subSection)) {
        return false
      }
    }
    // Checking if there is extra parameters, since we do not want extra parameters
    return !_.first(req.params);
  }, 
  generateShareUrl(gagId, title) {
    const shareUrl = {}
    const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?u=http://9gag.com/gag/'
    const twitterBaseUrl = 'https://twitter.com/intent/tweet?via=9GAG&source=tweetbutton&original_referer=http://9gag.com/gag/'
    const googlePlusBaseUrl = 'https://plus.google.com/share?url=http://9gag.com/gag/'
    const pinterestBaseUrl = 'https://www.pinterest.com/pin/create/button/?url=http://9gag.com/gag/'
    shareUrl.facebook = `${facebookBaseUrl + gagId}?ref=fb.s`
    shareUrl.twitter = `${twitterBaseUrl + gagId}?ref=t&text=${encodeURIComponent(title)}!&url=http://9gag.com/gag/${gagId}?ref=t`
    shareUrl.googlePlus = `${googlePlusBaseUrl + gagId}?ref=gp`
    shareUrl.pinterest = `${pinterestBaseUrl + gagId}?ref=pn&media=http://img-9gag-fun.9cache.com/photo/${gagId}_700b.jpg&description=${encodeURIComponent(title)}`
    return shareUrl
  },
  processComment(comment, opUserId) {
    const commentObj = {}
    commentObj.commentId = comment.commentId
    commentObj.userId = comment.user.displayName
    commentObj.text = unescape(comment.text)
    if (comment.userId == opUserId) {
      commentObj.isOp = true
    } else {
      commentObj.isOp = false
    }
    if (comment.level == 1) {
      commentObj.isChild = false
      commentObj.childrenCount = comment.childrenTotal
    } else {
      commentObj.isChild = true
    }
    commentObj.timestamp = comment.timestamp
    commentObj.likeCount = comment.likeCount
    return commentObj
  },
  async getFirstCommentChild(url) {
    const body = await this.getBodyFromUrl(url);
    // Get the first child of the comment so we can use the firstCommentId to extract other children comment
    const payload = JSON.parse(body).payload
    if (!payload || !(payload.comments[0])) {
      return undefined;
    }
    const opUserId = payload.opUserId;
    const firstChild = payload.comments[0].children[0];
    return _util.processComment(firstChild, opUserId);
  },
  generateHash(string) {
    const hash = sha1(string);
    hashMap[hash] = string;
    return sha1(string);
  },
  getValueInHashmap(hash) {
    if (hash in hashMap) {
      return hashMap[hash];
    } else {
      return '';
    }
  },
  getBodyFromUrl(url) {
    return new Promise((resolve, reject) => {
      request(url, (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(body);
      });
    });
  },
};

///////////////////////////
// API ROUTE STARTS HERE //
///////////////////////////

/**
 * Get data for a specific gag.
 *
 * @param gagId - the id of the gag
 */
app.get('/gag/:gagId', cache.route({ expire: 300 }), async (req, res) => {
  const url = `http://9gag.com/gag/${req.params.gagId}`;
  const response = await _9gag.getPost(url, req.params.gagId);
  res.json(response);
});

/**
 * Get 10 gags from a particular section and sub-section
 *
 * @param section - the section of the gag
 * @query subSection - the sub-section of the gag
 * @query loadMoreId - an id that allows user to load the next 10 gags from a particular section and sub-section
 */
app.get('/:section/', cache.route({ expire: 300 }), async (req, res) => {
  // Check if the URL is valid
  if (_util.isSectionValid(req)) {
    const url = `http://9gag.com/${req.params.section}/${!req.query.subSection ? '' : req.query.subSection}`;

    const response = await _9gag.getPosts(url, req.query.loadMoreId);

    // Add section and subSection key to response
    response.section = req.params.section;
    if (!_.includes(SPECIAL_SECTION_LIST, req.params.section)) {
      response.subSection = !req.query.subSection ? 'hot' : req.query.subSection;
    }
    res.json(response);
  } else {
    res.json({'status': NOT_FOUND, 'message': NOT_FOUND_MESSAGE});
  }
});

/**
 * Get the overview of a user
 *
 * @param userId - the userId of the user
 */
app.get('/user/:userId', async (req, res) => {
  const url = `http://9gag.com/u/${req.params.userId}`;
  const response = await _9gag.getPosts(url, req.query.loadMoreId);
  res.json(response);
});

/**
 * Get the posts of a user
 *
 * @param userId - the userId of the user
 * @query loadMoreId - an id that allows user to load the next 10 posts that the user posted
 */
app.get('/user/:userId/posts', cache.route({ expire: 300 }), async (req, res) => {
  const url = `http://9gag.com/u/${req.params.userId}/posts`;
  const response = await _9gag.getPosts(url, req.query.loadMoreId);
  res.json(response);
});

/**
 * Get the posts that the user upvoted
 *
 * @param userId - the userId of the user
 * @query loadMoreId - an id that allows user to load the next 10 gags that the user upvoted
 */
app.get('/user/:userId/upvotes', cache.route({ expire: 300 }), async (req, res) => {
  const url = `http://9gag.com/u/${req.params.userId}/likes`;
  const response = await _9gag.getPosts(url, req.query.loadMoreId);
  res.json(response);
});

/**
 * Get the comments of a gag
 *
 * @param gagId - the id of the gag
 * @query loadMoreId - an id that allows user to load the next 10 comments of the gag
 * @query section - the section of the comments (can be hot or fresh)
 */
app.get('/comment/:gagId', cache.route({ expire: 300 }), async (req, res) => {
  const appId = 'a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b'
  const gagUrl = encodeURIComponent(`http://9gag.com/gag/${req.params.gagId}`)

  //Append loadMoreId
  let url = `http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=${appId}&url=${gagUrl}&count=10&level=2&order=score`
  if (req.query.loadMoreId) {
    url += `&ref=${_util.getValueInHashmap(req.query.loadMoreId)}`;
  }

  const response = await _9gag.getComments(url);
  res.json(response);
});

/**
 * Get the comments of a gag
 *
 * @param gagId - the id of the gag
 * @param commentId - the id of the comment
 * @query loadMoreId - an id that allows user to load the next 10 comments of the gag
 */
app.get('/comment/:gagId/:commentId', cache.route({ expire: 300 }), async (req, res) => {
  const appId = 'a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b';
  const gagUrl = encodeURIComponent(`http://9gag.com/gag/${req.params.gagId}`);

  // If there is no loadMoreId, we need to find the id of the first child of the comment
  // We need to use that id to find the rest of the comment children
  // Otherwise, use the loadMoreId to load more comments
  if (!req.query.loadMoreId) {
    const url = `http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=${appId}&url=${gagUrl}&count=0&level=2&commentId=${req.params.commentId}`;
    const firstChildCommentObj = await _util.getFirstCommentChild(url);
    // Get the rest of the comment children using the firstChildCommentId
    const commentUrl = `http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=${appId}&url=${gagUrl}&count=10&level=1&refCommentId=${firstChildCommentObj.commentId}`;
    const response = await _9gag.getComments(commentUrl);
    // concatenate firstChildComment with the rest of the child comments
    response.comments = _.concat(firstChildCommentObj, response.comments);
    response.parent = req.params.commentId;
    res.json(response);
  } else {
    const commentUrl = `http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=${appId}&url=${gagUrl}&count=10&level=1&refCommentId=${_util.getValueInHashmap(req.query.loadMoreId)}`;
    const response = await _9gag.getComments(commentUrl);
    response.parent = req.params.commentId;
    res.json(response);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * Unknown requests will be routed to here
 */
app.get('*', (req, res) => {
  res.json({'status': BAD_REQUEST, 'message': "BAD_REQUEST_MESSAGE"});
});

app.listen(app.get('port'), () => {
  console.log('9gag API server started on port',  app.get('port'));
});

// Export app for testing purposes
module.exports = app;