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
        if (message.event_type === 'state_changed') {
            const element = document.getElementById(message.data.id);
            switch (message.data.type) {
                case 'switch':
                    element.checked = message.data.state;
                    break;
                case 'binary_sensor':
                    if (message.data.state) {
                        element.classList.add('checked');
                    } else {
                        element.classList.remove('checked');
                    }
                    break;
            }
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

const onSwitchToggle = element => {
    if (connected) {
        const message = {
            event_type: 'state_toggle',
            data: {
                id: element.id,
                type: 'switch'
            }
        };
        const data = JSON.stringify(message);
        ws.send(data);
    }
};

connect();

