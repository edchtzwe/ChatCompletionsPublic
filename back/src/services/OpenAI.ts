import OpenAI from 'openai';
import { logError, logInfo } from './Logger';
import { buildUserMessage, chatResponse, evalPressencePenalty, formatContextByProvider, getAvailableModels, getCitations, getModelConfig, reasoningEffortLevels, ROLES, searchContextSizes } from '@services/ChatCompletion';
import { Stream } from 'openai/streaming';
import { Settings } from './Settings';
import { ChatsModel } from '@models/Chats';
import { SystemInstructionsService } from './SystemInstuctions';

interface ProviderConfig {
    key: string;
    url: string;
}

const AI_PROVIDERS: Record<string, ProviderConfig> = {
    DEEPSEEK: {
        key: process.env.DEEPSEEK_API_KEY,
        url: 'https://api.deepseek.com/v1'
    },
    QWEN: {
        key: process.env.QWEN_API_KEY,
        url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
    },
    OPENAI: {
        key: process.env.OPENAI_API_KEY,
        url: 'https://api.openai.com/v1'
    },
    SONAR: {
        key: process.env.SONAR_API_KEY,
        url: 'https://api.perplexity.ai'
    }
};

export interface chatContext {
    role: string,
    content: string
};

export interface HyperParameters {
    name: string;
    value: string;
    default?: boolean;
    no_temperature?: boolean;
    web_search?: boolean;
    reasoning?: boolean;
    streaming?: boolean;
}

interface WebSearchOptions {
    search_context_size: number;
    user_location: {
        type: 'approximate';
        approximate: {
            country?: string;
            city?: string;
            region?: string;
        };
    };
};

type ExtendedChatCompletionCreateParams = OpenAI.Chat.Completions.ChatCompletionCreateParams & {
    web_search_options?: WebSearchOptions;
};

export type ChatCompletionWithCitations = OpenAI.Chat.Completions.ChatCompletion & {
    citations?: string[];
};

export const OpenAIService = (() => {
    return {
        getOpenAI(provider: string = "OPENAI"): OpenAI {
            const providerConfig = AI_PROVIDERS[provider.toUpperCase()];
            if (!providerConfig) {
                throw new Error(`AI provider '${provider}' is not configured.`);
            }

            return new OpenAI({
                apiKey: providerConfig.key,
                baseURL: providerConfig.url,
            });
        },
        buildChatContext(
            sessionId: string,
            aiProvider: string,
            userMessage: string,
            devMessage: string | undefined,
            chatHistoryDepth: number
        ): any[] {
            if (devMessage && devMessage.length > 0) {
                ChatsModel.update(
                    {
                        sessionId,
                        role: ROLES[aiProvider].SYSTEM,
                        message: devMessage,
                        jsonDump: 'Developer message'
                    },
                    aiProvider
                );
            }

            const chats = ChatsModel.fetchLastNChats(sessionId, aiProvider, chatHistoryDepth);
            const systemMessage = SystemInstructionsService.fetchDevMessageForSession(sessionId, aiProvider);

            chats.push(systemMessage);
            chats.push(buildUserMessage(sessionId, userMessage, aiProvider));

            return formatContextByProvider(chats, aiProvider);
        },
        async PromptAI(
            client: OpenAI,
            payload: OpenAI.Chat.Completions.ChatCompletionCreateParams,
            modelDefinition: HyperParameters
        ): Promise<ChatCompletionWithCitations> {
            if (modelDefinition.streaming) {
                payload.stream = true;

                logInfo(
                    `Model ${payload.model} requires streaming internally, accumulating chunks into a single response...`
                );

                const stream = (await client.chat.completions.create(
                    payload
                )) as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;

                let reasoningMessage = "";
                let responseMessage = "";
                let citations: string[] = [];
                let finishReason:
                    | "stop"
                    | "length"
                    | "tool_calls"
                    | "content_filter"
                    | "function_call"
                    | null = null;

                for await (const chunk of stream) {
                    logInfo(`Received chunk... ${JSON.stringify(chunk)}`);

                    const responseContent = chunk.choices[0]?.delta?.content;
                    if (responseContent) {
                        responseMessage += responseContent;
                    }

                    const reasoningContent = (chunk.choices[0]?.delta as any)?.reasoning_content;
                    if (reasoningContent) {
                        reasoningMessage += reasoningContent;
                    }

                    const chunkCitations = (chunk as any)?.citations;
                    if (chunkCitations?.length) {
                        citations = [...new Set([...citations, ...chunkCitations])];
                    }

                    const chunkFinishReason = chunk.choices[0]?.finish_reason;
                    if (chunkFinishReason) {
                        finishReason = chunkFinishReason as
                            | "stop"
                            | "length"
                            | "tool_calls"
                            | "content_filter"
                            | "function_call";
                        logInfo(`Streaming finished with reason: ${finishReason}`);
                        break;
                    }
                }

                const finalMessage = reasoningMessage
                    ? `<think> ${reasoningMessage}</think> ${responseMessage}`
                    : responseMessage;

                const finalCompletion: ChatCompletionWithCitations = {
                    id: `streamed-${Date.now()}`,
                    object: "chat.completion",
                    created: Math.floor(Date.now() / 1000),
                    model: payload.model,
                    choices: [
                        {
                            index: 0,
                            message: {
                                role: "assistant",
                                content: finalMessage,
                                refusal: null,
                            },
                            finish_reason: finishReason,
                            logprobs: null,
                        },
                    ],
                    usage: {
                        prompt_tokens: 0,
                        completion_tokens: 0,
                        total_tokens: 0,
                    },
                    citations: citations.length > 0 ? citations : undefined,
                };

                return finalCompletion;
            }

            logInfo(
                `Model ${payload.model} does not require streaming, initiating regular completion...`
            );

            const completion = (await client.chat.completions.create(
                payload
            )) as ChatCompletionWithCitations;

            return completion;
        },
        handleAIResponse(completion: ChatCompletionWithCitations, sessionId: string, message: string, devMessage: string, aiProvider: string) {
            if (!completion) {
                logError(
                    `No response from OpenAI. The current User message: ${message}`
                );
                return;
            }

            let responseMessage: string;

            if (
                completion.choices.length === 0 ||
                !completion.choices[0].message ||
                !completion.choices[0].message.content
            ) {
                logInfo(
                    `No response from ${aiProvider}. The current User message: ${message}`
                );
                responseMessage = "No response";
            } else {
                responseMessage = completion.choices[0].message.content;
            }

            const citations = getCitations(completion);
            if (citations && citations.length > 0) {
                responseMessage = responseMessage + "\n\n---\n\n" + citations;
            }

            ChatsModel.addToHistory([
                {
                    sessionId: sessionId,
                    role: "user",
                    message: message,
                    jsonDump: "User message, refer to next assistant response.",
                },
                {
                    sessionId: sessionId,
                    role: "assistant",
                    message: responseMessage,
                    jsonDump: JSON.stringify(completion),
                },
            ]);

            if (devMessage && devMessage.length > 0) {
                ChatsModel.update(
                    {
                        sessionId: sessionId,
                        role: ROLES[aiProvider].SYSTEM,
                        message: devMessage,
                        jsonDump: "Developer message",
                    },
                    aiProvider
                );
            }

            const response: chatResponse = {
                sessionId: sessionId,
                reply: responseMessage,
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0,
            };

            return response;
        },
    };
})();

export default OpenAIService;
