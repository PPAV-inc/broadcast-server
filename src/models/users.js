const getDatabase = require('./database');

const getSubscribeUsers = async hour => {
  const db = await getDatabase();
  const subscribedUsers = await db
    .collection('users')
    .find({ subscribe: true, subscribeHour: hour })
    .toArray();
  return subscribedUsers;
};

module.exports.getSubscribeUsers = getSubscribeUsers;
