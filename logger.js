import fs from 'fs';
import path from 'path';

// Create logs folder if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Function to format date and time
const formatDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Function to get log file name by date
const getLogFileName = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `app-${year}-${month}-${day}.log`;
};

// Function to write to file
const writeToFile = (level, message) => {
    const timestamp = formatDateTime();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    // Create file name with current date
    const logFileName = getLogFileName();
    const logFile = path.join(logsDir, logFileName);

    try {
        fs.appendFileSync(logFile, logMessage, 'utf8');
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
};

// Export logger
export const logger = {
    info: (message) => {
        console.log(`[INFO] ${message}`);
        writeToFile('INFO', message);
    },

    error: (message) => {
        console.error(`[ERROR] ${message}`);
        writeToFile('ERROR', message);
    },

    warn: (message) => {
        console.warn(`[WARN] ${message}`);
        writeToFile('WARN', message);
    },

    debug: (message) => {
        console.log(`[DEBUG] ${message}`);
        writeToFile('DEBUG', message);
    }
};

export default logger;