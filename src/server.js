const { router, post, get } = require('microrouter');
const R = require('ramda');
const compress = require('micro-compress');
const cors = require('micro-cors');

const healthyCheck = require('./routes/healthyCheck');
const broadcast = require('./routes/broadcast');
const redirect = require('./routes/redirect');

const enhance = R.compose(
  cors({
    allowMethods: ['GET', 'POST'],
    allowHeaders: [],
    origin: '*',
  }),
  compress
);

module.exports = router(
  post('/broadcast', enhance(broadcast)),
  get('/redirect/', enhance(redirect)),
  get('/', enhance(healthyCheck))
);
