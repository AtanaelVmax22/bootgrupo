const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com\/)/i;

function getMessageText(message = {}) {
  const msg = message.message || {};

  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.ephemeralMessage?.message) return getMessageText({ message: msg.ephemeralMessage.message });
  if (msg.viewOnceMessage?.message) return getMessageText({ message: msg.viewOnceMessage.message });

  return '';
}

function hasLink(text = '') {
  return LINK_REGEX.test(text);
}

function normalizeNumber(jid = '') {
  return jid.split('@')[0].replace(/[^0-9]/g, '');
}

function chunkText(text = '', maxLength = 900) {
  if (!text || text.length <= maxLength) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length);

    if (end < text.length) {
      const breakPoint = text.lastIndexOf(' ', end);
      if (breakPoint > start + Math.floor(maxLength * 0.6)) {
        end = breakPoint;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks.filter(Boolean);
}

module.exports = {
  getMessageText,
  hasLink,
  normalizeNumber,
  chunkText,
};
