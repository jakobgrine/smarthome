let connected, ws;

const connect = () => {
    ws = new WebSocket(`ws://${location.host}`);
    const disconnectMessage = document.getElementById('disconnect-message');
    let lastPing = Date.now();
    let interval;

    ws.onmessage = event => {
        if (event.data === 'ping') {
            lastPing = Date.now();
            return;
        }

        const message = JSON.parse(event.data);
        switch (message.event_type) {
            case 'timer_updated':
                addTimer(message.data);
                break;
            case 'timer_removed':
                removeTimer(document.getElementById(message.data.id), true);
                break;
        }
    };

    ws.onopen = event => {
        disconnectMessage.classList.remove('show');
        connected = true;

        interval = setInterval(() => {
            if (Date.now() - lastPing > 5000) {
                disconnectMessage.classList.add('show');
                connected = false;
                clearInterval(interval);
                setTimeout(connect, 5000);
            }
        }, 5000);
    };

    ws.onclose = event => {
        disconnectMessage.classList.add('show');
        connected = false;
        clearInterval(interval);
        setTimeout(connect, 5000);
    };
};

connect();

const timerContainer = document.getElementById('timer-container');
const addTimerCard = document.getElementById('add-timer-card');

const addTimer = (data) => {
    if (!data) {
        const id = Math.floor(Math.random()*1e12).toString(16);

        const template = document.getElementById('add-timer-template');
        const timerCard = template.cloneNode(true);
        timerCard.setAttribute('id', id);
        timerCard.removeAttribute('hidden');

        const savedIndicator = timerCard.querySelector('#add-timer-template-saved');
        savedIndicator.setAttribute('id', id + '-saved');

        timerContainer.insertBefore(timerCard, addTimerCard);

        return;
    } else {
        let timerCard = document.getElementById(data.id);

        if (!timerCard) {
            const template = document.getElementById('add-timer-template');
            timerCard = template.cloneNode(true);
            timerCard.removeAttribute('hidden');

            timerContainer.insertBefore(timerCard, addTimerCard);
        }

        timerCard.setAttribute('id', data.id);

        const enabledInput = timerCard.querySelector('input[type="checkbox"]');
        enabledInput.checked = data.enabled;

        const timeInput = timerCard.querySelector('input[type="time"]');
        timeInput.value = data.time;

        const entityInput = timerCard.querySelector('select.entity-input');
        entityInput.value = data.entity_id;

        const actionInput = timerCard.querySelector('select.action-input');
        actionInput.value = data.action;
    }
};

const removeTimer = (element, doNotSend) => {
    if (element) {
        element.remove();
    }

    if (connected && !doNotSend) {
        const message = {
            event_type: 'timer_remove',
            data: {
                id: element.id,
            },
        };
        const data = JSON.stringify(message);
        ws.send(data);
    }
};

const saveTimer = (element) => {
    if (connected) {
        const enabledInput = element.querySelector('input[type="checkbox"]');
        const timeInput = element.querySelector('input[type="time"]');
        const entityInput = element.querySelector('select.entity-input');
        const actionInput = element.querySelector('select.action-input');

        const message = {
            event_type: 'timer_update',
            data: {
                id: element.id,
                enabled: enabledInput.checked,
                time: timeInput.value,
                entity_id: entityInput.value,
                action: actionInput.value,
            },
        };
        const data = JSON.stringify(message);
        ws.send(data);

        const savedIndicator = document.getElementById(element.id + "-saved");
        savedIndicator.classList.add('show');
        setTimeout(() => savedIndicator.classList.remove('show'), 500);
    }
};

