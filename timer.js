chrome.storage.onChanged.addListener(handleDoneListChanges);

(function () {
    let taskList = document.getElementById('done-tasks-list');
    let doneTask = document.getElementById('done-task');
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

    // Create timer object
    new Timer(function () {
        setTimerElement(timerValue++);
    }, 1000);

    // Handle create done task button
    document.getElementById('add-done-task').addEventListener('click', function () {
        // Create li tag and append it to list with inserted title
        let listItem = document.createElement('li');
        const timerTags = createTimerTags(timerValue);

        listItem.innerText = `${doneTask.value} -- ${timerTags.template}`;
        taskList.appendChild(listItem);

        const now = new Date().getTime();

        // Push into Storage sync DoneList
        setDoneListToStorage({title: doneTask.value, startAt: startTimestamp, endAt: now});

        // Refresh timer to start from zero
        timerValue = 0;

        // Empty input value
        doneTask.value = '';

        // Change storage value to current timestamp
        setStartTimestampToStorage();
    });
})();

/**
 * Get Start timestamp from sync storage
 * @param callback
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