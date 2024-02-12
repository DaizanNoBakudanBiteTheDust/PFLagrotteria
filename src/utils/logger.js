import winston from 'winston';

const Enviroment = 'development';

const customLevelOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'green',
        debug: 'blue'
    }
};


let logger;

if (Enviroment === 'production') {
    logger = winston.createLogger({
        levels: customLevelOptions.levels,
        transports: [
            new winston.transports.Console({
                level: 'info',
                format: winston.format.combine(
                    winston.format.colorize({
                        all: true,
                        colors: customLevelOptions.colors
                    }),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({
                filename: '../logs/errors.log',
                level: 'error'
            })
        ]
    });
} else {
    logger = winston.createLogger({
        transports: [
            new winston.transports.Console({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.colorize({
                        all: true,
                        colors: customLevelOptions.colors
                    }),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({
                filename: 'logs/errors.log',
                level: 'error'
            })
        ]
    });
}

export const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.info(`${req.method} en ${req.url} - ${new Date().toISOString()}`);
    next();
};

export {logger};
