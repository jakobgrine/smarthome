const { entities: pins } = require('./config.json');
const rpio = require('rpio');

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

exports.setup = callback => {
    rpio.init({ mapping:'gpio' });
    for (const [id, pin] of Object.entries(pins)) {
        if (typeof pin.state_pin !== 'undefined' && pin.state_pin >= 0) {
            rpio.open(pin.state_pin, rpio.INPUT, rpio.PULL_UP);

            const func = debounce(() => callback(id, !rpio.read(pin.state_pin)), 100);
            rpio.poll(pin.state_pin, func);
            func();
        }
        if (typeof pin.action_pin !== 'undefined' && pin.action_pin >= 0) {
            rpio.open(pin.action_pin, rpio.OUTPUT, rpio.HIGH);
        }
    }
};

exports.toggleState = id => {
    const pin = pins[id];
    if (typeof pin !== 'undefined'
            && typeof pin.action_pin !== 'undefined'
            && pin.action_pin >= 0) {
        rpio.write(pin.action_pin, rpio.LOW);
        setTimeout(() => {
            rpio.write(pin.action_pin, rpio.HIGH);
        }, 250);
    }
};

exports.setState = (id, state) => {
    const pin = pins[id];
    if (typeof pin !== 'undefined'
            && typeof pin.state_pin !== 'undefined' && pin.state_pin >= 0
            && typeof pin.action_pin !== 'undefined' && pin.action_pin >= 0) {
        const currentState = rpio.read(pin.state_pin);
        if (state !== currentState) {
            rpio.write(pin.action_pin, rpio.LOW);
            setTimeout(() => {
                rpio.write(pin.action_pin, rpio.HIGH);
            }, 250);
        }
    }
};

