chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);
chrome.storage.onChanged.addListener(handleDoneListChanges);

/**
 * Initialize extension
 * @param details
 */
function init(details) {
    setStartTimestampToStorage();
    initDoneListStorage();
}

/**
 * Set timer start timestamp to storage
 */
function setStartTimestampToStorage() {
    chrome.storage.sync.set({timerStartAt: new Date().getTime()});
}

/**
 * Init Done list storage as empty array
 */
function initDoneListStorage() {
    chrome.storage.sync.set({doneList: []});
}

function handleDoneListChanges(changes, areaName) {
    console.log(changes.doneList);
}