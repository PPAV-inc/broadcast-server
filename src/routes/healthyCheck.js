const { send } = require('micro');

const healthyCheck = async (req, res) => {
  await send(res, 200, 'I am good');
};

module.exports = healthyCheck;
