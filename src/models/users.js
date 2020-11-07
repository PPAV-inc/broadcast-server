const getDatabase = require('./database');

const getSubscribeUsers = async (hour) => {
  const db = await getDatabase();
  const subscribedUsers = await db
    .collection('users')
    .find({ subscribe: true, subscribeHour: hour })
    .toArray();
  return subscribedUsers;
};

const getAllUsers = async (languageCode) => {
  const db = await getDatabase();
  const allUsers = await db
    .collection('users')
    .find({ languageCode: { $regex: new RegExp(`^${languageCode}`, 'i') } })
    .toArray();
  return allUsers;
};

const getUnacceptedUsers = async () => {
  const db = await getDatabase();
  const allUnacceptedUsers = await db
    .collection('users')
    .find({ acceptDisclaimer: false })
    .toArray();
  return allUnacceptedUsers;
};

module.exports = { getSubscribeUsers, getAllUsers, getUnacceptedUsers };
