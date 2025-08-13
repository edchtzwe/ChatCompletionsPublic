export interface ModelDefinition {
    name: string;
    model: string;
    streaming?: boolean;
    default?: boolean;
    no_temperature?: boolean;
    web_search?: boolean;
    reasoning?: boolean;
    doer?: { key: string; value: boolean };
    value: string;
    max_tokens?: number;
}

export const MODEL_MAP: Record<string, ModelDefinition[]> = {
    openai: [
        { name: '4o', model: 'gpt-4o-2024-11-20', streaming: true, value: '67e55044-10b1-426f-9247-bb680e5fe0c8' },
        { name: '4.1', model: 'gpt-4.1-2025-04-14', streaming: true, value: '9f5a8036-5a1c-4d8f-bc85-7aa2d941a836', default: true },
        { name: 'Web Search', model: 'gpt-4o-search-preview-2025-03-11', no_temperature: true, web_search: true, value: '12a42d5b-c32e-4d91-b67e-f2d40ab405ae' },
        // { name: '4.5', model: 'gpt-4.5-preview-2025-02-27', streaming: true, value: 'e8f7c3a1-d4b2-4f89-9c6d-8e5a2b1f3d7c' }, // RIP buddy, you're the best. 2025-07-14
        { name: 'Chat GPT', model: 'chatgpt-4o-latest', streaming: true, value: 'f6d9e5c4-b3a2-4d81-9f7e-6b5c4d3a2f1e' },
        { name: 'o4 Mini', model: 'o4-mini-2025-04-16', no_temperature: true, reasoning: true, value: 'a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5' },
        { name: 'o1', model: 'o1-2024-12-17', no_temperature: true, value: 'd4c3b2a1-f6e5-4h7g-9i8j-m1n2o3p4q5r6' },
    ],
    deepseek: [
        { name: 'Chat', model: 'deepseek-chat', default: true, streaming: true, value: '7b8a9c6d-5e4f-4321-b098-7654dcba3210' },
        { name: 'Reasoner', model: 'deepseek-reasoner', reasoning: true, streaming: true, value: '2f1e3d4c-5b6a-4789-0123-456789abcdef' },
    ],
    qwen: [
        { name: 'Qwen 3 Doer', model: 'qwen3-235b-a22b', streaming: true, reasoning: false, doer: { key: 'enable_thinking', value: false }, default: true, value: 'c5d4e3f2-1a2b-4567-89ab-cdef01234567' },
        { name: 'Qwen 3 Thinker', model: 'qwen3-235b-a22b', streaming: true, reasoning: true, value: '98765432-10fe-4dcb-a987-654321fedcba' },
        { name: 'Qwen 2.5', model: 'qwen2.5-14b-instruct-1m', streaming: true, value: 'abcdef12-3456-789a-bcde-f0123456789a' },
        { name: 'Max', model: 'qwen-max', streaming: true, value: '11111111-2222-3333-4444-555555555555' },
        { name: 'Plus', model: 'qwen-plus', streaming: true, value: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' },
        { name: 'Turbo', model: 'qwen-turbo', streaming: true, value: '12121212-3434-5656-7878-909090909090' },
        { name: 'QwQ Reasoning', model: 'qwq-plus', streaming: true, reasoning: true, value: 'fedcba98-7654-3210-fedc-ba9876543210' },
    ],
    sonar: [
        { name: 'Chat', model: 'sonar', streaming: true, web_search: true, default: true, value: '01234567-89ab-cdef-0123-456789abcdef' },
        { name: 'Pro', model: 'sonar-pro', streaming: true, web_search: true, value: '11223344-5566-7788-99aa-bbccddeeff00' },
        { name: 'Reasoning', model: 'sonar-reasoning', streaming: true, web_search: true, reasoning: true, value: 'aabbccdd-eeff-0011-2233-445566778899' },
        { name: 'Reasoning Pro', model: 'sonar-reasoning-pro', streaming: true, web_search: true, reasoning: true, value: '99887766-5544-3322-1100-ffeeddccbbaa' },
        { name: 'Deep Research', model: 'sonar-deep-research', streaming: true, web_search: true, reasoning: true, value: 'abcdef01-2345-6789-abcd-ef0123456789' },
        { name: 'Unbiased Offline', model: 'r1-1776', streaming: true, value: '00112233-4455-6677-8899-aabbccddeeff' },
    ],
    google: [
        { name: '2.5 Flash', model: 'models/gemini-2.5-flash', value: 'cafebabe-cafe-babe-cafe-babecafebabe', default: true },
        { name: '2.5 Pro', model: 'gemini-2.5-pro', value: 'deadbeef-dead-beef-dead-beefdeadbeef' },
        { name: '2.0 Flash', model: 'gemini-2.0-flash', value: 'baaaaaad-baad-baad-baad-baadbaaaaaad' },
        { name: '2.0 Flash Lite', model: 'gemini-2.0-flash-lite', value: 'feedface-feed-face-feed-facefeedface' },
    ],
    anthropic: [
        { name: 'Sonnet 4', model: 'claude-sonnet-4-20250514', streaming: true, value: 'c0ffeeee-c0ff-eeee-c0ff-eeeec0ffeeee', default: true },
        { name: 'Opus 4', model: 'claude-opus-4-20250514', streaming: true, value: 'deaddead-dead-dead-dead-deaddeaddead' },
        { name: 'Sonnet 3.5', model: 'claude-3-5-sonnet-latest', streaming: true, value: 'dec0dec0-dec0-dec0-dec0-dec0dec0dec0' },
        { name: 'Haiku 3.5', model: 'claude-3-5-haiku-latest', streaming: true, web_search: true, value: 'facade42-faca-de42-faca-de42facade42' },
    ],
};
