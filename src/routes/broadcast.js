const { json, send } = require('micro');

const broadcast = async (req, res) => {
  const body = await json(req);

  send(res, 200, body);
};

module.exports = broadcast;
