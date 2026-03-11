const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const config = require('./config.json');

const { getMessageText, hasLink } = require('./utils/helpers');
const { isAdmin } = require('./utils/groupUtils');
const { getMenu } = require('./commands/menu');
const { responderAdmins, alterarGrupo, alterarParticipante } = require('./commands/admin');
const { executarComandoChat } = require('./commands/chatgpt');

const logger = pino({ level: 'info' });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    logger,
    printQRInTerminal: false,
    browser: ['Termux Bot', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📲 Escaneie o QR Code abaixo com o WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado com sucesso!');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log('⚠️ Conexão fechada. Motivo:', statusCode || 'desconhecido');

      if (shouldReconnect) {
        console.log('🔄 Tentando reconectar...');
        startBot();
      } else {
        console.log('❌ Sessão encerrada. Apague auth_info/ e conecte novamente.');
      }
    }
  });

  sock.ev.on('group-participants.update', async (event) => {
    try {
      if (!config.welcome || event.action !== 'add') return;

      for (const user of event.participants) {
        await sock.sendMessage(event.id, {
          text: '👋 Bem-vindo ao grupo!',
          mentions: [user],
        });
      }
    } catch (error) {
      console.error('[ERRO_WELCOME]', error.message);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    try {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = msg.key.participant || msg.key.remoteJid;
      const text = getMessageText(msg).trim();

      if (!text) return;

      if (isGroup && config.antiLink && hasLink(text)) {
        const metadata = await sock.groupMetadata(from);
        const senderIsAdmin = isAdmin(metadata, sender);

        if (!senderIsAdmin) {
          await sock.sendMessage(from, {
            text: '🚫 Links não são permitidos. Usuário será removido.',
            mentions: [sender],
          });
          await sock.groupParticipantsUpdate(from, [sender], 'remove');
          return;
        }
      }

      if (!text.startsWith(config.prefix)) return;

      const body = text.slice(config.prefix.length).trim();
      const [commandRaw, ...args] = body.split(/\s+/);
      const command = commandRaw.toLowerCase();
      const argText = args.join(' ');

      console.log(`[COMANDO] ${command} | sender=${sender}`);

      if (command === 'ping') {
        await sock.sendMessage(from, { text: 'pong 🏓' });
        return;
      }

      if (command === 'menu') {
        await sock.sendMessage(from, { text: getMenu(config.prefix) });
        return;
      }

      if (!isGroup) {
        await sock.sendMessage(from, { text: 'Este bot foi projetado para funcionar em grupos.' });
        return;
      }

      const metadata = await sock.groupMetadata(from);
      const senderIsAdmin = isAdmin(metadata, sender);

      if (command === 'admins') {
        await responderAdmins(sock, from, metadata);
        return;
      }

      if (['abrir', 'fechar', 'ban', 'promover', 'rebaixar'].includes(command) && !senderIsAdmin) {
        await sock.sendMessage(from, { text: '❌ Apenas admins podem usar este comando.' });
        return;
      }

      if (command === 'abrir' || command === 'fechar') {
        await alterarGrupo(sock, from, command);
        return;
      }

      if (['ban', 'promover', 'rebaixar'].includes(command)) {
        await alterarParticipante(sock, from, msg, command);
        return;
      }

      if (command === 'chat') {
        if (!config.chatgpt) {
          await sock.sendMessage(from, { text: '⚠️ O comando /chat está desativado no config.json.' });
          return;
        }

        await executarComandoChat(sock, from, argText);
      }
    } catch (error) {
      console.error('[ERRO_MENSAGEM]', error);
    }
  });
}

startBot().catch((error) => {
  console.error('❌ Erro ao iniciar bot:', error);
});
