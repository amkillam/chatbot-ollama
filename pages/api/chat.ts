import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE, DEFAULT_CONTEXT_WINDOW_SIZE } from '@/utils/app/const';
import { OllamaError, OllamaStream } from '@/utils/server';

import { ChatBody, Message } from '@/types/chat';


export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, system, options, prompt } = (await req.json()) as ChatBody;


    let promptToSend = system;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = options?.temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    let contextWindowSize = options?.num_ctx;
    if (contextWindowSize == null) {
      contextWindowSize = DEFAULT_CONTEXT_WINDOW_SIZE;
    }

    const stream = await OllamaStream (model, promptToSend, temperatureToUse, contextWindowSize, prompt);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OllamaError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
