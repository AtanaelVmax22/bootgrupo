# WhatsApp Group Bot (Baileys + OpenAI)

Bot de gerenciamento de grupos para WhatsApp, feito em Node.js e pronto para rodar no Termux.

## Requisitos

- Node.js 18+
- Termux atualizado
- Conta do WhatsApp para conectar via QR Code
- Chave OpenAI (`OPENAI_API_KEY`) para usar `/chat`

## Instalação

```bash
cd whatsapp-group-bot
npm install
```

## Configuração

Edite `config.json` com suas preferências.

Configure a variável de ambiente:

```bash
export OPENAI_API_KEY="sua_chave_aqui"
```

> Dica (Termux): coloque o `export` no `~/.bashrc` para persistir.

## Rodar

```bash
node index.js
```

No primeiro start, escaneie o QR Code no terminal.

## Comandos

- `/menu`
- `/ping`
- `/admins`
- `/abrir`
- `/fechar`
- `/ban @usuario`
- `/promover @usuario`
- `/rebaixar @usuario`
- `/chat pergunta`

## Observações

- Sessão salva em `auth_info/`.
- Anti-link remove usuários não-admin que enviarem links.
- Mensagens de boas-vindas são enviadas quando alguém entra no grupo.
