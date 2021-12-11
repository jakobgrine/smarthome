const path = require('path');

const { GpioModule, IkeaTradfriModule } = require('./modules');

const config = require('./config.json');
config.cards.forEach(
    card =>
        card.entities = card.entities.map(x => config.entities[x])
);

const express = require('express');
const app = express();

const http = require('http');
const httpServer = http.createServer(app);

const WebSocket = require('ws');
const webSocketServer = new WebSocket.Server({ server: httpServer });

const broadcast = message => {
    const data = JSON.stringify(message);
    webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

const states = {};

const modules = {
    tradfri: new IkeaTradfriModule(device => {
        const entity = Object.values(config.entities)
            .find(entity => entity['tradfri_id'] == device.instanceId);
        if (typeof entity === 'undefined')
            return;

        states[entity.id] = device.lightList[0].onOff;
        broadcast({
            event_type: 'state_changed',
            data: {
                id: entity.id,
                state: device.lightList[0].onOff,
            },
        });
    }),
    gpio: new GpioModule((id, state) => {
        const entity = config.entities[id];
        if (typeof entity === 'undefined') {
            return;
        }

        states[id] = state;
        broadcast({
            event_type: 'state_changed',
            data: {
                id: id,
                state: state,
            },
        });
    }),
};

Object.values(config.entities).forEach(
    entity =>
        Object.values(modules)
            .find(m => m.entityTypes.includes(entity.type))
            .initEntity(entity.id)
);

const { CronScheduler } = require('./cron.js');
const scheduler = new CronScheduler(timer => {
    const entity = config.entities[timer['entity_id']];
    if (typeof entity === 'undefined')
        return;

    const state = timer.action === 'turn_on';

    const module = Object.values(modules)
        .find(m => m.entityTypes.includes(entity.type));
    if (typeof module === 'undefined')
        return;

    module.setEntityState(entity.id, state);
});

webSocketServer.on('connection', ws => {
    const pingIntervalId = setInterval(() => ws.send('ping'), 2000);

    ws.on('close', () => clearInterval(pingIntervalId));

    ws.on('message', msg => {
        const event = JSON.parse(msg);
        switch (event.event_type) {
            case 'state_toggle':
                const entityType = config.entities[event.data.id].type;
                const module = Object.values(modules)
                    .find(m => m.entityTypes.includes(entityType));
                if (typeof module !== 'undefined')
                    module.toggleEntityState(event.data.id);
                break;
            case 'timer_update':
                scheduler.addTimer(event.data);
                broadcast({
                    event_type: 'timer_updated',
                    data: event.data,
                });
                break;
            case 'timer_remove':
                scheduler.removeTimer(event.data.id);
                broadcast({
                    event_type: 'timer_removed',
                    data: event.data,
                });
                break;
        }
    });
});

const { Liquid } = require('liquidjs');
const liquid = new Liquid({
    root: path.resolve(__dirname, 'templates/'),
    extname: '.tpl',
    jsTruthy: true,
    globals: {
        ...config,
        states,
        timers: scheduler.timers,
    },
});
liquid.registerFilter('flatten', o => Object.values(o));

const asyncMiddleware = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.use(express.static(path.resolve(__dirname, 'public/')));

app.get('/', asyncMiddleware(async (req, res) => {
    const html = await liquid.renderFile('index');
    res.send(html);
}));

app.get('/settings', asyncMiddleware(async (req, res) => {
    const html = await liquid.renderFile('settings');
    res.send(html);
}));

httpServer.listen(process.env.NODE_PORT || 3000);

