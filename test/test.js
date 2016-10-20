var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../src/9gag');
var should = chai.should();
var assert = chai.assert;

chai.use(chaiHttp);

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
    it('should not get a gag information successfully - GET /gag/:gagId', function(done) {
        chai.request(server)
            .get('/gag/abcdef')
            .end(function(err, res) {
                var gag = res.body.gag;
                assert.equal(res.body.status, 404);
                done();
            });
    })
});