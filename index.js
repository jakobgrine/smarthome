const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Liquid } = require('liquidjs');
const path = require('path');
const fs = require('fs');
const { IntervalBasedCronScheduler, parseCronExpression } = require('cron-schedule');

const { GpioModule, IkeaTradfriModule } = require('./modules');

const config = require('./config.json');
config.cards.forEach(
    card =>
        card.entities = card.entities.map(x => config.entities[x])
);

const app = express();
const httpServer = http.createServer(app);
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

const timeToCron = time => {
    const [hour, minute] = time.split(':');
    return parseCronExpression(`${minute} ${hour} * * *`);
};

const timers = require('./timers.json');
const cronTimers = {};
const scheduler = new IntervalBasedCronScheduler(10*1000);

const cronHandler = id => () => {
    const timer = timers[id];
    if (typeof timer === 'undefined')
        return;

    const entity = config.entities[timer['entity_id']];
    if (typeof entity === 'undefined')
        return;

    const state = timer.action === 'turn_on';

    const module = Object.values(modules)
        .find(m => m.entityTypes.includes(entity.type));
    if (typeof module === 'undefined')
        return;

    module.setEntityState(entity.id, state);
};

const addTimer = timer => {
    const cron = timeToCron(timer.time);

    try {
        scheduler.unregisterTask(cronTimers[timer.id]);
    } catch {}

    if (timer.enabled) {
        const taskId = scheduler.registerTask(cron, cronHandler(timer.id));
        cronTimers[timer.id] = taskId;
    }
};

for (const id in timers) {
    const timer = timers[id];
    addTimer(timer);
}

const removeTimer = id => {
    try {
        scheduler.unregisterTask(cronTimers[id]);
    } catch {}
};

const saveTimers = () => {
    const json = JSON.stringify(timers, null, 4);
    fs.writeFile('timers.json', json, err => {
        if (err) {
            throw err;
        }
    });
};

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
                timers[event.data.id] = event.data;
                addTimer(event.data);
                saveTimers();
                broadcast({
                    event_type: 'timer_updated',
                    data: event.data,
                });
                break;
            case 'timer_remove':
                delete timers[event.data.id];
                removeTimer(event.data.id);
                saveTimers();
                broadcast({
                    event_type: 'timer_removed',
                    data: event.data,
                });
                break;
        }
    });
});

const liquid = new Liquid({
    root: path.resolve(__dirname, 'templates/'),
    extname: '.tpl',
    globals: {
        ...config,
        states,
        timers,
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

