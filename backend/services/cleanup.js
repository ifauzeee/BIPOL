const supabase = require('../config/supabase');
const logger = require('../utils/logger');

async function cleanupOldData() {
    try {
        const retentionHours = parseInt(process.env.DATA_RETENTION_HOURS) || 24;
        const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
            .from('bipol_tracker')
            .delete()
            .lt('created_at', cutoffDate);

        if (error) throw error;
        logger.cleanup.done(retentionHours);
    } catch (err) {
        logger.error('Cleanup failed', { error: err.message });
    }
}

function startCleanupJobs() {
    setInterval(cleanupOldData, 60 * 60 * 1000);
    cleanupOldData();
}

module.exports = { startCleanupJobs };