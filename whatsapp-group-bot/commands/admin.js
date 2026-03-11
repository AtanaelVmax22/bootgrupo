const { getAdmins, extractMentionedUser } = require('../utils/groupUtils');
const { normalizeNumber } = require('../utils/helpers');

async function responderAdmins(sock, jid, groupMetadata) {
  const admins = getAdmins(groupMetadata);

  if (!admins.length) {
    await sock.sendMessage(jid, { text: 'Não encontrei admins neste grupo.' });
    return;
  }

  const texto = admins
    .map((admin, index) => `${index + 1}. @${normalizeNumber(admin.id)}`)
    .join('\n');

  await sock.sendMessage(jid, {
    text: `👮 *Admins do grupo:*\n\n${texto}`,
    mentions: admins.map((a) => a.id),
  });
}

async function alterarGrupo(sock, jid, acao) {
  const announcement = acao === 'fechar';
  await sock.groupSettingUpdate(jid, announcement ? 'announcement' : 'not_announcement');

  await sock.sendMessage(jid, {
    text: announcement
      ? '🔒 Grupo fechado. Apenas admins podem enviar mensagens.'
      : '🔓 Grupo aberto. Todos podem enviar mensagens.',
  });
}

async function alterarParticipante(sock, jid, message, acao) {
  const alvo = extractMentionedUser(message);

  if (!alvo) {
    await sock.sendMessage(jid, {
      text: 'Marque o usuário. Exemplo: /ban @usuario',
    });
    return;
  }

  const mapAcao = {
    ban: 'remove',
    promover: 'promote',
    rebaixar: 'demote',
  };

  await sock.groupParticipantsUpdate(jid, [alvo], mapAcao[acao]);

  const mensagens = {
    ban: '🚫 Usuário removido com sucesso.',
    promover: '⬆️ Usuário promovido para admin.',
    rebaixar: '⬇️ Usuário rebaixado de admin.',
  };

  await sock.sendMessage(jid, {
    text: mensagens[acao],
    mentions: [alvo],
  });
}

module.exports = {
  responderAdmins,
  alterarGrupo,
  alterarParticipante,
};
