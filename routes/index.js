var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { baseUri: config.baseUri });
});

router.post('/listgroups', function (req, res) {
  hitSlackApi('groups.list', req.body, res);
});

router.post('/creategroup', function (req, res) {
  hitSlackApi('groups.create', req.body, res);
});

router.post('/invitetogroup', function (req, res) {
  hitSlackApi('groups.invite', req.body, res);
});

function hitSlackApi(method, params, res) {
  request.get({
    url: config.slack.api + method,
    json: true,
    qs: params
  },
  function (err, response, body) {
    if (!err && response.statusCode == 200) {
      res.json(body);
    }
  });
}

module.exports = router;
