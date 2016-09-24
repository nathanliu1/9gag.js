var express = require('express');
var app = express();

app.get('/gag/:gagId', function(req, res) {
	console.log(req.params);
	res.json({'gagId': req.params.gagId});
})

app.listen(3000)