export interface model {
    'model':string,
    'store':boolean,
    'app_mode':string
};

export const Settings = (() => {
    let settings: model = {
        'model':process.env.BASE_MODEL || "gpt-4o",
        'store':(process.env.ENABLE_STORE === 'true'),
        'app_mode':process.env.APP_MODE || "dev"
    };

    return {
        setModel(model: string): void {
            settings.model = model;
        },
        getModel(): string {
            return settings.model;
        },
        storeEnabled(): boolean {
            return settings.store;
        },
        setAppMode(app_mode: string): void {
            settings.app_mode = app_mode;
        },
        getAppMode(): string {
            return settings.app_mode;
        }
    }
}
)(); // IIFE (Immediately Invoked Function Expression. Creates a Singleton in memory. Object address is exposed globally.)
