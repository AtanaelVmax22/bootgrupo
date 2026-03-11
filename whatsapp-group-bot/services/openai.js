const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function perguntarChatGPT(pergunta) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada no ambiente.');
  }

  const promptSistema =
    'Você é um assistente para grupos de WhatsApp. Responda em português brasileiro, de forma curta e clara. Limite total aproximado de 800 caracteres.';

  const response = await client.responses.create({
    model: 'gpt-5.3',
    input: [
      { role: 'system', content: promptSistema },
      { role: 'user', content: pergunta },
    ],
    max_output_tokens: 260,
  });

  const text = response.output_text?.trim();

  if (!text) {
    return 'Não consegui gerar resposta agora. Tente novamente em instantes.';
  }

  return text.slice(0, 800);
}

module.exports = {
  perguntarChatGPT,
};
