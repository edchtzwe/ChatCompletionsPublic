import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info', // Default to 'info'
    transport: {
        target: 'pino-pretty', // Makes logs readable in console
        options: { colorize: true }
    }
});

export const logInfo = (message: string) => {
    if (process.env.APP_MODE !== 'dev') {
        logger.info("No logging in Prod.");
        return;
    }

    logger.info(message);
};

export const logError = (message: string) => {
    if (process.env.APP_MODE !== 'dev') {
        logger.info("No logging in Prod.");
        return;
    }

    logger.error(message);
};
