var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { baseUri: config.baseUri });
});

/* POST request dup group from home page */
router.post('/', function (req, res) {
  dupGroup(req, res);
});

function dupGroup(req, res) {
  var groups;
  var newGroup;
  var oldGroup;

  hitSlackApi('groups.list', { token: req.body.token }, function (err, response, body) {
    if (err || response.statusCode !== 200) return;
    groups = body.groups;

    hitSlackApi('groups.create', { token: req.body.token, name: req.body.copyto }, function (err, response, body) {
      if (err || response.statusCode !== 200) return;
      newGroup = body.group;
      oldGroup = getGroupToCopyFrom(groups, req.body.copyfrom);

      oldGroup.members.forEach(function (x) {
        setTimeout(function () {
          hitSlackApi('groups.invite', { token: req.body.token, channel: newGroup.id, user: x});
        }, 100);
      });

      res.sendStatus(200);
    });
  });
}

function getGroupToCopyFrom (groups, copyfrom) {
  var filtered = groups.filter(function (x) {
    return x.name === copyfrom;
  });
  return filtered.length > 0 ? filtered[0] : null;
}

function hitSlackApi(method, params, cb) {
  request.get({
    url: config.slack.api + method,
    json: true,
    qs: params
  }, cb);
}

module.exports = router;
