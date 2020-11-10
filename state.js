const pins = require('./config/pins.json');
const rpio = require('rpio');

exports.setup = () => {
    rpio.init({mapping:'gpio'});
    for (const pin of Object.values(pins)) {
        if (typeof pin.state_pin !== 'undefined') {
            rpio.open(pin.state_pin, rpio.INPUT, rpio.PULL_UP);
        }
        if (typeof pin.action_pin !== 'undefined') {
            rpio.open(pin.action_pin, rpio.OUTPUT, rpio.HIGH);
        }
    }
};

let callback_; // temp as long as no real hardware

exports.setState = (id, state) => {
    console.log(`setting ${id} to ${state}`);
    const pin = pins[id];
    if (typeof pin !== 'undefined' && typeof pin.action_pin !== 'undefined') {
        rpio.write(pin.action_pin, rpio.LOW);
        setTimeout(() => {
            rpio.write(pin.action_pin, rpio.HIGH);
        }, 250);
    }
};

exports.onChange = callback => {
    callback_ = callback; // temp as long as no real hardware
    for (const [id, pin] of Object.entries(pins)) {
        if (typeof pin === 'undefined' || typeof pin.state_pin === 'undefined') {
            continue;
        }
        rpio.poll(pin.state_pin, () => callback(id, !rpio.read(pin.state_pin)));
    }
};

