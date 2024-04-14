"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitedUpdate = void 0;
// Limit rate of updates out of yaAGC into the api, as it causes issues with the display renderer. 
// This issue should probably be addressed client-side as well.
let lastUpdate = 0;
let queuedUpdate = null;
const rateLimitedUpdate = (handler, state, priority = false) => {
    const currentTime = new Date().getTime();
    const timePassed = currentTime - lastUpdate;
    const timeRemaining = 300 - timePassed;
    if (timePassed >= 300 || priority) {
        if (queuedUpdate)
            clearTimeout(queuedUpdate);
        //console.log(`${priority ? 'PRIORITY':'UNQUEUED'} UPDATE V1: `,state.VerbD1)
        handler(state);
        lastUpdate = currentTime;
    }
    else {
        if (queuedUpdate)
            clearTimeout(queuedUpdate);
        queuedUpdate = setTimeout(() => {
            //console.log("QUEUED UPDATE V1: ",state.VerbD1)
            handler(state);
            lastUpdate = new Date().getTime();
        }, timeRemaining);
    }
};
exports.rateLimitedUpdate = rateLimitedUpdate;
