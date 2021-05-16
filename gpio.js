const pins = require('./config/pins.json');
const rpio = require('rpio');
const { debounce } = require('./debounce');

exports.setup = callback => {
    rpio.init({mapping:'gpio'});
    for (const [id, pin] of Object.entries(pins)) {
        if (typeof pin.state_pin !== 'undefined') {
            rpio.open(pin.state_pin, rpio.INPUT, rpio.PULL_UP);

            const func = debounce(() => callback(id, !rpio.read(pin.state_pin)), 100);
            rpio.poll(pin.state_pin, func);
            func();
        }
        if (typeof pin.action_pin !== 'undefined') {
            rpio.open(pin.action_pin, rpio.OUTPUT, rpio.HIGH);
        }
    }
};

exports.toggleState = id => {
    const pin = pins[id];
    if (typeof pin !== 'undefined' && typeof pin.action_pin !== 'undefined') {
        rpio.write(pin.action_pin, rpio.LOW);
        setTimeout(() => {
            rpio.write(pin.action_pin, rpio.HIGH);
        }, 250);
    }
};

