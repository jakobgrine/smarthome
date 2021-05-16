require('dot').process({
    global: '__page.render',
    destination: __dirname + '/render/',
    path: __dirname + '/templates/'
});

const render = require('./render');
const state = require('./gpio');
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const httpServer = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server: httpServer });

const entities = require('./config/entities');
const states = {};

webSocketServer.on('connection', ws => {
    const id = setInterval(() => {
        ws.send('ping');
    }, 2000);

    ws.on('close', () => {
        clearInterval(id);
    });

    ws.on('message', msg => {
        const event = JSON.parse(msg);
        if (event.event_type === 'state_toggle') {
            state.toggleState(event.data.id);
        }
    });
});

state.setup((id, state) => {
    if (typeof entities[id] === 'undefined') {
        return;
    }

    states[id] = state;
    const message = {
        event_type: 'state_changed',
        data: {
            id: id,
            type: entities[id].type,
            state: state
        }
    };
    const data = JSON.stringify(message);
    for (let client of webSocketServer.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
});


app.use(express.static(__dirname + '/public/'));

const cards = require('./config/cards.json');
for (const card of cards) {
    card.entities = card.entities.map(x => entities[x]);
}

app.get('/', (req, res) => {
    res.send(render.dashboard({cards, states}));
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something broke!');
});

httpServer.listen(process.env.NODE_PORT || 3000);

