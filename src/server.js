const { router, post, get } = require('microrouter');

const healthyCheck = require('./routes/healthyCheck');
const broadcast = require('./routes/broadcast');

module.exports = router(post('/broadcast', broadcast), get('/', healthyCheck));
