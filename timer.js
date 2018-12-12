let taskList = document.getElementById('done-tasks-list');
let doneTask = document.getElementById('done-task');
let timerValue = 18877;

// Calculate immediately after start
calculateTimer();

// Create timer object
let timer = new Timer(calculateTimer, 1000);

// Handle create done task button
document.getElementById('add-done-task').addEventListener('click', function () {
    // Create li tag and append it to list with inserted title
    let listItem = document.createElement('li');
    listItem.innerText = `${doneTask.value} -- ${calculateTimer()}`;
    taskList.appendChild(listItem);

    // Refresh timer to start from zero
    timerValue = 0;

    // Empty input value
    doneTask.value = '';
});

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

function calculateTimer() {
    let timer = timerValue++;

    let hour = timer >= (60 * 60) ? Math.floor(timer / (60 * 60)) : 0;
    timer -= hour * (60 * 60);
    let minute = timer < 60 ? 0 : Math.floor((timer / 60));
    let second = (timer < 60) ? timer : Math.floor((timer % 60));

    let secondElm = document.createElement('small').innerText = second.toString();
    let minuteElm = document.createElement('small').innerText = minute.toString();
    let hourElm = document.createElement('small').innerText = hour.toString();

    return document.getElementById('timer-box').innerHTML = `${hourElm}h ${minuteElm}m ${secondElm}s`;
};