var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../src/9gag');
var should = chai.should();
var assert = chai.assert;

chai.use(chaiHttp);

var loadMoreId;

describe('9GAG API SERVER TESTS', function() {
    it('should get a gag information successfully - GET /gag/:gagId', function(done) {
        chai.request(server)
            .get('/gag/aXw5g2v')
            .end(function(err, res) {
                var gag = res.body.gag;
                assert.equal(res.body.status, 200);
                assert.equal(gag.id, 'aXw5g2v');
                assert.equal(gag.title, 'House Goals.');
                assert.property(gag.images, 'small');
                assert.property(gag.images, 'cover');
                assert.property(gag.images, 'normal');
                assert.property(gag.images, 'large');
                assert.equal(gag.url, 'http://9gag.com/gag/aXw5g2v');
                assert.typeOf(gag.votes, 'number');
                assert.typeOf(gag.comments, 'number');
                assert.property(gag.share, 'facebook');
                assert.property(gag.share, 'twitter');
                assert.property(gag.share, 'googlePlus');
                assert.property(gag.share, 'pinterest');
                done();
            });
    }),
    it('should get an array of gag id from wtf section successfully - GET /:section?subSection=:subSection&loadMoreId=:loadMoreId', function(done) {
        chai.request(server)
            .get('/wtf')
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.lengthOf(response.data, 10);
                assert.equal(response.section, 'wtf');
                assert.equal(response.subSection, 'hot');
                loadMoreId = response.loadMoreId;
                done();
            });
    }),
    it('should get an array of gag id from wtf section with loadMoreId successfully - GET /:section?subSection=:subSection&loadMoreId=:loadMoreId', function(done) {
        chai.request(server)
            .get('/wtf?loadMoreId=' + loadMoreId)
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.lengthOf(response.data, 10);
                assert.equal(response.section, 'wtf');
                assert.equal(response.subSection, 'hot');
                done();
            });
    }),
    it('should get an overview of a user (lovinghist) successfully - GET /user/:userId', function(done) {
        chai.request(server)
            .get('/user/lovinghist')
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.equal(response.userId, 'lovinghist');
                assert.equal(response.profileImage, 'http://accounts-cdn.9gag.com/media/avatar/1668205_100_1.jpg');
                assert.equal(response.url, 'http://9gag.com/u/lovinghist');
                done();
            });
    }),
    it('should get an array of gag id that the user (_s4tan_) posts - GET /user/:userId/posts?loadMoreId=:loadMoreId', function(done) {
        chai.request(server)
            .get('/user/_s4tan_/posts')
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.lengthOf(response.data, 10);
                assert.equal(response.userId, '_s4tan_');
                loadMoreId = response.loadMoreId;
                done();
            });
    }),
    it('should get an array of gag id with loadMoreId that the user (_s4tan_) posts - GET /user/:userId/posts?loadMoreId=:loadMoreId', function(done) {
        chai.request(server)
            .get('/user/_s4tan_/posts?loadMoreId=' + loadMoreId)
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.lengthOf(response.data, 10);
                assert.equal(response.userId, '_s4tan_');
                done();
            });
    }),
    it('should get an array of gag id that the user (_s4tan_) upvotes - GET /user/:userId/upvotes?loadMoreId=:loadMoreId', function(done) {
        chai.request(server)
            .get('/user/_s4tan_/upvotes')
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.lengthOf(response.data, 10);
                assert.equal(response.userId, '_s4tan_');
                loadMoreId = response.loadMoreId;
                done();
            });
    }),
    it('should get an array of gag id with loadMoreId that the user (tomi139) upvotes - GET /user/:userId/upvotes?loadMoreId=:loadMoreId', function(done) {
        chai.request(server)
            .get('/user/tomi139/upvotes?loadMoreId=' + loadMoreId)
            .end(function(err, res) {
                var response = res.body;
                assert.equal(response.status, 200);
                assert.lengthOf(response.data, 10);
                assert.equal(response.userId, 'tomi139');
                done();
            });
    })
});