import * as fs from 'fs';

export const createWatcher = async (watchPath, callback) => {
    let watcher
    while (!watcher) {
        try {
            watcher = fs.watch(watchPath, callback);
            // Create the watchers on start
            callback();
            console.log(`Watcher created successfully for ${watchPath}`);
            return watcher
        } catch (error) {
            console.error(`Unable to create watcher for ${watchPath}: ${error.message}`); 
            await new Promise((resolve) => setTimeout(resolve, 5000));// Avoid flooding the console with errors
        }
    }
};