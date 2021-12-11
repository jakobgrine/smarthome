const { TradfriClient } = require('node-tradfri-client');
const config = require('../config.json');

class IkeaTradfriModule {
    entityTypes = [
        'tradfri_light',
    ];

    #initialized = false;

    devices = {};

    // callback: (device: Accessory) => void;
    constructor(callback) {
        this.callback = callback;
    }

    #init() {
        this.client = new TradfriClient(config.tradfri.hostname);

        const { identity, psk } = config.tradfri.auth;
        this.client.connect(identity, psk)
            .then(() => {
                this.client
                    .on('device updated', device => {
                        this.devices[device.instanceId] = device;
                        this.callback(device);
                    })
                    .on('device removed', instanceId => {
                        delete this.devices[instanceId];
                    })
                    .observeDevices();
            })
            .catch(console.error);
    }

    initEntity(entity) {
        if (!this.#initialized) {
            this.#init();
            this.#initialized = true;
        }
    }

    toggleEntityState(entityId) {
        const entity = config.entities[entityId];
        if (typeof entity === 'undefined')
            return;

        const deviceId = entity.tradfri_id;
        const device = this.devices[deviceId];
        if (typeof device === 'undefined')
            return;

        const light = device.lightList[0];
        if (typeof light === 'undefined')
            return;

        light.toggle();
    }

    setEntityState(entityId, state) {
        const entity = config.entities[entityId];
        if (typeof entity === 'undefined')
            return;

        const deviceId = entity.tradfri_id;
        const device = this.devices[deviceId];
        if (typeof device === 'undefined')
            return;

        const light = device.lightList[0];
        if (typeof light === 'undefined')
            return;

        if (light.onOff !== state)
            light.toggle();
    }
}

module.exports = {
    IkeaTradfriModule,
};

