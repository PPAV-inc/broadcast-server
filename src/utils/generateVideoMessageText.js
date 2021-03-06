const dateFormat = require('dateformat');
const locale = require('./locale');

const generateVideoMessageText = (languageCode, result) => {
  const videoWord = locale(languageCode).videos;

  const models =
    result.models.length !== 0
      ? `${videoWord.model}: ${result.models.join(', ')}\n`
      : '';
  const tags = result.tags
    ? `${videoWord.tag}: ${result.tags.join(', ')}\n`
    : '';
  const score = result.score ? `${videoWord.score}: ${result.score}\n` : '';
  const length = result.length
    ? `${videoWord.length}: ${result.length} ${videoWord.minute}\n`
    : '';
  const publishedAt = result.publishedAt
    ? `${videoWord.publishedAt}: ${dateFormat(
        result.publishedAt,
        'yyyy/mm/dd'
      )}\n`
    : '';

  return `
    ${videoWord.code}: ${result.code}\n${videoWord.title}: ${result.title}\n${models}${tags}${score}${length}${publishedAt}
  `;
};

module.exports = generateVideoMessageText;
