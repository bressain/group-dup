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
  dupGroup(req.body, res);
});

router.post('/dupgroup', function (req, res) {
  dupGroup({
    token: config.slack.token,
    copyfrom: req.body.channel_name,
    copyfromid: req.body.channel_id,
    copyto: req.body.text
  }, res);
});

function dupGroup(opts, res) {
  var groups;
  var newGroup;
  var oldGroup;
  opts.copyfromid = opts.copyfromid || '';

  console.log('Request to dup group:');
  console.dir(opts);
  hitSlackApi('groups.list', { token: opts.token }, function (err, response, body) {
    if (err || response.statusCode !== 200 || !body.ok) return;
    groups = body.groups;

    hitSlackApi('groups.create', { token: opts.token, name: opts.copyto }, function (err, response, body) {
      if (err || response.statusCode !== 200 || !body.ok) return;
      newGroup = body.group;
      oldGroup = getGroupToCopyFrom(groups, opts.copyfrom, opts.copyfromid);

      oldGroup.members.forEach(function (x) {
        setTimeout(function () {
          hitSlackApi('groups.invite', { token: opts.token, channel: newGroup.id, user: x});
        }, 100);
      });

      res.sendStatus(200);
    });
  });
}

function getGroupToCopyFrom (groups, copyfrom, copyfromid) {
  var filtered = groups.filter(function (x) {
    return x.name === copyfrom || x.id === copyfromid;
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
