const generateVideoMessageText = require('./generateVideoMessageText');

const inlineKeyboardOptions = keyboard => ({
  reply_markup: {
    inline_keyboard: keyboard,
  },
  parse_mode: 'Markdown',
  disable_web_page_preview: false,
});

const newVideoKeyboard = (languageCode, result) => {
  const keyboard = [];

  for (let i = 0; i < result.videos.length; i += 1) {
    keyboard.push([
      {
        text: `🔞 ${result.videos[i].source}   👁 ${result.videos[i]
          .view_count || 0}`,
        url: result.videos[i].url,
      },
    ]);
  }

  return {
    ...inlineKeyboardOptions(keyboard),
    caption: generateVideoMessageText(languageCode, result),
  };
};

module.exports = {
  newVideoKeyboard,
};
