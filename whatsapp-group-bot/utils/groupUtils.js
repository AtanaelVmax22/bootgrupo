function extractMentionedUser(message = {}) {
  const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (Array.isArray(mentioned) && mentioned.length > 0) return mentioned[0];

  return null;
}

function isAdmin(groupMetadata = {}, jid = '') {
  const participant = (groupMetadata.participants || []).find((p) => p.id === jid);
  return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

function getAdmins(groupMetadata = {}) {
  return (groupMetadata.participants || []).filter(
    (p) => p.admin === 'admin' || p.admin === 'superadmin'
  );
}

module.exports = {
  extractMentionedUser,
  isAdmin,
  getAdmins,
};
