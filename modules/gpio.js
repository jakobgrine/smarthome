const rpio = require('rpio');
const config = require('../config.json');

const debounce = (func, delay) => {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, delay);
    };
};

class GpioModule {
    entityTypes = [
        'gpio_binary_sensor',
        'gpio_impulse_relay',
    ];

    #initialized = false;

    // callback: (entityId: string, state: bool) => void
    constructor(callback) {
        this.callback = callback;
    }

    #init() {
        rpio.init({ mapping: 'gpio' });
    }

    initEntity(entityId) {
        if (!this.#initialized) {
            this.#init();
            this.#initialized = true;
        }

        const entity = config.entities[entityId];
        if (typeof entity === 'undefined')
            return;

        const statePin = entity['state_pin'];
        if (typeof statePin !== 'undefined' && statePin >= 0) {
            rpio.open(statePin, rpio.INPUT);

            const func = debounce(() => this.callback(entity.id, rpio.read(statePin) ^ entity['state_active_low']), 100);
            rpio.poll(statePin, func);
            func();
        }

        const actionPin = entity['action_pin'];
        if (typeof actionPin !== 'undefined' && actionPin >= 0) {
            rpio.open(actionPin, rpio.OUTPUT, entity['action_active_low'] ? rpio.HIGH : rpio.LOW);
        }
    }

    toggleEntityState(entityId) {
        const entity = config.entities[entityId];
        if (typeof entity === 'undefined')
            return;

        const actionPin = entity['action_pin'];
        if (typeof actionPin !== 'undefined' && actionPin >= 0) {
            rpio.write(actionPin, entity['action_active_low'] ? rpio.LOW : rpio.HIGH);
            setTimeout(() => {
                rpio.write(actionPin, entity['action_active_low'] ? rpio.HIGH : rpio.LOW);
            }, 250);
        }
    }

    setEntityState(entityId, state) {
        const entity = config.entities[entityId];
        if (typeof entity === 'undefined')
            return;

        const statePin = entity['state_pin'];
        const actionPin = entity['action_pin'];
        if (typeof actionPin !== 'undefined' && actionPin >= 0 &&
            typeof statePin !== 'undefined' && statePin >= 0) {
            const currentState = rpio.read(statePin) ^ entity['state_active_low'];
            if (state !== currentState) {
                rpio.write(actionPin, entity['action_active_low'] ? rpio.LOW : rpio.HIGH);
                setTimeout(() => {
                    rpio.write(actionPin, entity['action_active_low'] ? rpio.HIGH : rpio.LOW);
                }, 250);
            }
        }
    }
}

module.exports = {
    GpioModule,
};

