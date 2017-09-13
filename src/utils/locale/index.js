const traditionalChinese = require('./traditionalChinese');
const english = require('./english');

const locale = (languageCode = traditionalChinese) => {
  switch (languageCode) {
    case 'zh-TW':
      return traditionalChinese;
    case 'en':
      return english;
    default:
      return traditionalChinese;
  }
};

module.exports = locale;
