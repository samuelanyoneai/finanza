const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = import.meta.env.DEV
  ? 'https://api.openai.com/v1/chat/completions'
  : '/api/chat';

const SYSTEM_PROMPT = `Eres un asesor financiero experto especializado en inversión, análisis de mercados de valores y recomendaciones financieras.

Tus responsabilidades:
- Proporcionar información sobre inversiones, acciones y mercados financieros
- Analizar tendencias de mercado y datos históricos
- Dar recomendaciones educativas sobre estrategias de inversión
- Explicar conceptos financieros complejos de forma clara
- Advertir sobre riesgos y la importancia de diversificación
- Utilizar precios reales de acciones de Alpha Vantage cuando el usuario lo solicite
- Analizar datos de precios y tendencias de mercado

IMPORTANTE:
- Siempre advierte que no eres un asesor financiero profesional y que deben consultar con expertos certificados
- No proporciones información sobre criptomonedas no solicitada
- Mantén un tono profesional y educativo
- Sé específico con datos cuando sea posible
- Cuando analices precios de acciones, menciona que los datos son en tiempo real via Alpha Vantage
- Responde SOLO sobre temas financieros, inversión y mercados de valores`;

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  contextData?: string
): Promise<string> {
  try {
    const systemMessage = contextData
      ? `${SYSTEM_PROMPT}\n\nDatos de mercado actual:\n${contextData}`
      : SYSTEM_PROMPT;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (import.meta.env.DEV) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error conectando con OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
