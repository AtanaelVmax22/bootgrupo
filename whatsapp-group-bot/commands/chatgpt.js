const { perguntarChatGPT } = require('../services/openai');
const { chunkText } = require('../utils/helpers');

async function executarComandoChat(sock, jid, pergunta) {
  if (!pergunta?.trim()) {
    await sock.sendMessage(jid, { text: 'Use: /chat sua pergunta' });
    return;
  }

  await sock.sendMessage(jid, { text: '🧠 Pensando...' });

  try {
    const resposta = await perguntarChatGPT(pergunta.trim());
    const partes = chunkText(resposta, 900);

    for (const parte of partes) {
      await sock.sendMessage(jid, { text: parte });
    }
  } catch (error) {
    console.error('[ERRO_CHATGPT]', error.message);
    await sock.sendMessage(jid, {
      text: '❌ Não consegui responder agora. Verifique a chave da OpenAI e tente novamente.',
    });
  }
}

module.exports = {
  executarComandoChat,
};
