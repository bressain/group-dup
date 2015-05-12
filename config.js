module.exports = {
  slack: {
    api: process.env.SLACK_API, // e.g. 'https://myslack.slack.com/api/'
    token: process.env.SLACK_TOKEN // see Slack docs to see how to get this
  },
  baseUri: process.env.BASEURI // e.g. 'http://localhost:3000/'
};
