const path = require('path');
const fs = require('fs');

const req = name => {
    const module = require('./' + name);
    delete exports[name];
    return exports[name] = module;
};

fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js' || file[0] === '_')
        return;
    const ext = path.extname(file);
    const stats = fs.statSync(__dirname + '/' + file);
    if (stats.isFile() && !(ext in require.extensions))
        return;
    const basename = path.basename(file, '.js');
    exports.__defineGetter__(basename, () => req(basename));
});

