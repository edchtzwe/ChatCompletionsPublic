import OpenAIService from "@services/OpenAI";
import { getAvailableModels, getProviderSDK } from "./ChatCompletion";
import OpenAI from "openai";
import { logError, logInfo } from "./Logger";
import { ChatCompletion } from "openai/resources";
import { GoogleGenAI } from "@google/genai";
import GoogleAIService, { GoogleAIPayloadParameters } from "./Google";
import Anthropic from "@anthropic-ai/sdk";
import AnthropicAIService, { AnthropicPayloadParameters } from "@services/Anthropic";
import { ModelDefinition } from "@services/ModelConfiguration";

export interface ChatParams {
    sessionId: string;
    aiProvider: string;
    message: string;
    devMessage: string;
    chatHistoryDepth: number;
    model: string;
    temperature: number;
    searchContextSize: number;
    reasoningEffort: number;
}

const getModelDefinition = (params: {aiProvider: string, model: string}): ModelDefinition => {
    const { aiProvider, model} = params;

    const modelDefinition = getAvailableModels(aiProvider).find(m => m.value === model);
    
    if (!modelDefinition) {
        throw new Error(`Model definition for ${model} not found.`);
    }

    return modelDefinition;
};

const doOpenAI = (client: OpenAI, params: ChatParams): Promise<ChatCompletion> => {
    const { sessionId, aiProvider, message, devMessage, chatHistoryDepth, model, temperature, searchContextSize, reasoningEffort } = params;
    const context = OpenAIService.buildChatContext(sessionId, aiProvider, message, devMessage, chatHistoryDepth) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    const payload = OpenAIService.openAIChatCompletionPayload(
        context,
        model,
        temperature,
        aiProvider,
        searchContextSize,
        reasoningEffort
    );

    try {
        const openAIService = OpenAIService;
        const modelDefinition = getModelDefinition({aiProvider, model});

        return openAIService.PromptAI(client, payload, modelDefinition);
    }
    catch (error) {
        logError(`Error getting model definition ... ${error} ...`);

        return undefined;
    }
};

const doGoogleGemini = (client: GoogleGenAI, params: ChatParams) =>  {
    const { sessionId, aiProvider, message, devMessage, chatHistoryDepth, model, temperature, searchContextSize, reasoningEffort } = params;
    const context = GoogleAIService.buildChatContext(sessionId, message, chatHistoryDepth);
    let payloadParameters: GoogleAIPayloadParameters = {
        sessionId:sessionId,
        context:context,
        model:model,
        devMessage:devMessage,
        temperature:temperature
    };
    const payload = GoogleAIService.googleAIChatCompletionPayload(payloadParameters);
    const response = GoogleAIService.PromptAI(client, payload, message).then((response) => {
        console.log("Google Gemini response: ", response);
        return response;
    }).catch((error) => {
        logError(`Error in Google Gemini response: ${error}`);
        return undefined;
    }
    );
    return response;
};

const doAnthropicClaude = async (client: Anthropic, params: ChatParams) => {
    const { sessionId, message, devMessage, chatHistoryDepth, model, temperature } = params;

    const context = AnthropicAIService.buildChatContext(sessionId, message, chatHistoryDepth);

    let payloadParameters: AnthropicPayloadParameters = {
        sessionId: sessionId,
        context: context, // Context now includes the user message
        model: model,
        devMessage: devMessage,
        temperature: temperature
    };

    const payload = AnthropicAIService.anthropicAIChatCompletionPayload(payloadParameters);

    const response = await AnthropicAIService.sendAnthropicRequest(client, payload).then((response) => {
        console.log("Anthropic Claude response: ", response);
        return response;
    }).catch((error) => {
        // CHANGE: Update log message
        logError(`Error in Anthropic Claude response: ${error}`);
        return undefined; // Keep original error handling logic
    });

    return response;
};

export const StartChat = (params: ChatParams) => {
    const { aiProvider } = params;
    let client = undefined;

    switch (aiProvider.toLowerCase()) {
        case "openai":
        case "deepseek":
        case "qwen":
        case "sonar":
            client = getProviderSDK(aiProvider) as OpenAI;

            return doOpenAI(client, params);
        case "google":
            client = getProviderSDK(aiProvider) as GoogleGenAI;

            return doGoogleGemini(client, params);
        case "anthropic":
            client = getProviderSDK(aiProvider) as Anthropic;

            return doAnthropicClaude(client, params);
        default:
            logError(`#[AICLIENT] : START-CHAT-ERROR : AI provider ${aiProvider} is not supported.`);
            throw new Error(`AI provider ${aiProvider} is not supported.`);
    }
};
