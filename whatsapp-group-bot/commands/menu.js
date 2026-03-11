function getMenu(prefix) {
  return [
    '🤖 *Menu de Comandos*',
    '',
    `${prefix}menu - Mostra este menu`,
    `${prefix}ping - Testa se o bot está online`,
    `${prefix}admins - Lista admins do grupo`,
    `${prefix}abrir - Abre o grupo (apenas admins)`,
    `${prefix}fechar - Fecha o grupo (apenas admins)`,
    `${prefix}ban @usuario - Remove membro`,
    `${prefix}promover @usuario - Torna admin`,
    `${prefix}rebaixar @usuario - Remove admin`,
    `${prefix}chat pergunta - Pergunta para a IA`,
  ].join('\n');
}

module.exports = {
  getMenu,
};
