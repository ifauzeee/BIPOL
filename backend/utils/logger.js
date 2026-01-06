/**
 * Production-ready Logger Utility
 * Provides structured logging with environment awareness
 */

const isProduction = process.env.NODE_ENV === 'production';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const colors = {
    error: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[36m',
    debug: '\x1b[90m',
    reset: '\x1b[0m'
};

function formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();

    if (isProduction) {
        // JSON format for production (easy to parse by log aggregators)
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
        });
    }

    // Colored console format for development
    const color = colors[level] || colors.reset;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}${metaStr}`;
}

const logger = {
    info: (message, meta = {}) => {
        console.log(formatMessage('info', message, meta));
    },

    warn: (message, meta = {}) => {
        console.warn(formatMessage('warn', message, meta));
    },

    error: (message, meta = {}) => {
        console.error(formatMessage('error', message, meta));
    },

    debug: (message, meta = {}) => {
        if (!isProduction) {
            console.log(formatMessage('debug', message, meta));
        }
    },

    // Shorthand methods with emojis for server events
    server: {
        start: (port) => logger.info(`🚀 Server Socket.io running on Port ${port}`),
        shutdown: () => logger.info('🛑 SIGTERM received. Shutting down gracefully...'),
        closed: () => logger.info('✅ Server closed'),
        security: () => logger.info('🔒 Security features enabled'),
        cleanup: (hours) => logger.info(`🧹 Auto-Cleanup scheduler active (${hours}h retention)`)
    },

    socket: {
        connect: (id) => logger.debug(`🔌 Client connected: ${id}`),
        disconnect: (id, reason) => logger.debug(`❌ Client disconnected: ${id} (${reason})`)
    },

    udp: {
        raw: (address, port, message) => logger.debug(`📨 UDP RAW from ${address}:${port} -> ${message}`),
        parsed: (busId, lat, lon, speed, gas) => logger.info(`📡 [UDP] ${busId} | 📍 ${lat.toFixed(6)},${lon.toFixed(6)} | 🚀 ${speed} | ⛽ ${gas}`),
        listening: (port) => logger.info(`⚡ UDP Server listening on Port ${port}`),
        error: (err) => logger.error(`❌ UDP Error: ${err.message}`, { stack: err.stack })
    },

    geofence: {
        loaded: (count) => logger.info(`🌍 Loaded ${count} Geofence Zones`),
        entered: (busId, zoneId, zoneName) => logger.info(`✅ ${busId} ENTERED Zone ${zoneId} (${zoneName})`),
        exited: (busId, zoneId) => logger.info(`⚠️ ${busId} EXITED Zone ${zoneId}`)
    },

    settings: {
        loaded: (settings) => logger.info('⚙️ Settings loaded', { settings })
    },

    cleanup: {
        done: (hours) => {
            const time = new Date().toLocaleTimeString('id-ID');
            logger.info(`🧹 [${time}] Auto-Cleanup: Deleted data older than ${hours}h`);
        }
    },

    db: {
        error: (message, err) => logger.error(`❌ DB Error: ${message}`, { error: err?.message })
    }
};

module.exports = logger;
