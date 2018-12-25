chrome.storage.onChanged.addListener(handleDoneListChanges);

(function () {
    let doneListsElm = document.getElementById('done-tasks-list');
    let taskTitleInput = document.getElementById('done-task');
    let addTaskBtn = document.getElementById('add-done-task');
    let timerValue = 0;
    let startTimestamp = 0;

    // Get timer start timestamp from sync storage
    getStartTimestampFromStorage(function (storage) {
        let now = new Date().getTime();

        // Set start timestamp
        startTimestamp = storage.timerStartAt;

        // convert timestamp to seconds
        timerValue = Math.floor((now - storage.timerStartAt) / 1000);
    });

    // Calculate immediately after start
    setTimerElement(timerValue);

    getDoneListFromStorage(storage => {
        storage.doneList.forEach(doneItem => {
            const timerTags = createTimerTags((doneItem.endAt - doneItem.startAt) / 1000);
            appendToDoneList(doneListsElm, generateDoneItem(doneItem.title, timerTags.template));
        });
    });

    // Create timer object
    new Timer(function () {
        setTimerElement(timerValue++);
    }, 1000);

    // Handle create done task button click
    addTaskBtn.addEventListener('click', function () {
        handleNewItemEvent(doneListsElm, taskTitleInput, startTimestamp, timerValue);

        // Refresh timer to start from zero
        timerValue = 0;
    });

    // Handle create done task input keyUp
    taskTitleInput.addEventListener('keyup', function (event) {
        if (dispatchForCode(event) !== 'Enter') {
            return;
        }

        addTaskBtn.click();
    });
})();

function handleNewItemEvent(doneListsElm, taskTitleInput, startTimestamp, timerValue) {
    const timerTags = createTimerTags(timerValue);

    // Append new generated item to list
    appendToDoneList(doneListsElm, generateDoneItem(taskTitleInput.value, timerTags.template));

    // Push into Storage sync DoneList
    setDoneListToStorage({title: taskTitleInput.value, startAt: startTimestamp, endAt: new Date().getTime()});

    // Empty input value
    taskTitleInput.value = '';

    // Change storage value to current timestamp
    setStartTimestampToStorage();
}

/**
 * Generate Done Item
 * @param {string} title
 * @param {string} timestamp
 * @return {string}
 */
function generateDoneItem(title, timestamp) {
    return `${title} -- ${timestamp}`;
}

/**
 * Append new Done Item to list
 * @param {HTMLElement} elm
 * @param {string} value
 */
function appendToDoneList(elm, value) {
    // Create li tag and append it to list with inserted title
    let listItem = document.createElement('li');

    listItem.innerText = value;
    elm.appendChild(listItem);
}

/**
 * Get Start timestamp from sync storage
 * @param {function} callback
 */
function getStartTimestampFromStorage(callback) {
    // Get timer start timestamp from sync storage
    chrome.storage.sync.get('timerStartAt', callback);
}

/**
 * Set Start timestamp to sync storage
 */
function setStartTimestampToStorage() {
    chrome.storage.sync.set({timerStartAt: new Date().getTime()});
}

/**
 * Push new item into DoneList storage
 * @param {DoneList} item
 */
function setDoneListToStorage(item) {
    getDoneListFromStorage(function (storage) {
        storage.doneList.push(item);
        chrome.storage.sync.set({doneList: storage.doneList});
    });
}

/**
 * Get Done list from storage
 * @param callback
 */
function getDoneListFromStorage(callback) {
    chrome.storage.sync.get('doneList', callback);
}

function handleDoneListChanges(changes, areaName) {
    // changes.doneList;
}

/**
 * Calculate timer properties
 * @param {int} timer
 * @return {{hours: number, minutes: number, seconds: number}}
 */
function calculateTimer(timer) {
    let hours = timer >= (60 * 60) ? Math.floor(timer / (60 * 60)) : 0;
    timer -= hours * (60 * 60);
    hours = (hours < 10) ? '0' + hours : hours;

    let minutes = timer < 60 ? 0 : Math.floor((timer / 60));
    minutes = (minutes < 10) ? '0' + minutes : minutes;

    let seconds = (timer < 60) ? timer : Math.floor((timer % 60));
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return {
        hours,
        minutes,
        seconds,
    };
}

/**
 * Set timer object to new created element
 * @param {int} timer
 * @return {string}
 */
function setTimerElement(timer) {
    const timerTags = createTimerTags(timer);

    document.getElementById('timer-box').innerHTML = timerTags.template;
}

/**
 * Create timer tags default tag is <small>
 * @param timer
 * @return {{secondElm: string, minuteElm: string, hourElm: string, template: string}}
 */
function createTimerTags(timer) {
    const timerOjb = calculateTimer(timer);
    const secondElm = document.createElement('small').innerText = timerOjb.seconds.toString();
    const minuteElm = document.createElement('small').innerText = timerOjb.minutes.toString();
    const hourElm = document.createElement('small').innerText = timerOjb.hours.toString();

    return {
        secondElm,
        minuteElm,
        hourElm,
        template: `${hourElm}h ${minuteElm}m ${secondElm}s`,
    };
}

/**
 * Timer object
 * @param func
 * @param time
 * @constructor
 */
function Timer(func, time) {
    let timerObj = setInterval(func, time);

    /**
     * Stop timer
     * @return {Timer}
     */
    this.stop = function () {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    };

    /**
     * Start timer using current settings (if it's not already running)
     * @return {Timer}
     */
    this.start = function () {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(func, time);
        }
        return this;
    };

    /**
     * Start with new interval, stop current interval
     * @param newTime
     * @return {Timer|*|void|number}
     */
    this.reset = function (newTime) {
        time = newTime;
        return this.stop().start();
    };
}

/**
 * @typedef {object} DoneList
 * @property {string} title -Task title
 * @property {number} startAt -Start timestamp
 * @property {number} endAt -End timestamp
 */

/**
 * Handle cross browser key code from keyboardEvent
 *
 * @param event
 */
function dispatchForCode(event) {
    let code;

    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyIdentifier !== undefined) {
        code = event.keyIdentifier;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }

    return code;
}