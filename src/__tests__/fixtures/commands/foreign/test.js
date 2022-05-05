/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */

const { Command } = require('../../../../../dist/src/Command');

module.exports.default = new Command({
  name: 'js_file',
  description: 'this is a command in js',
  isPrivate: false,
  options: [],
  exec({ log }) {
    log.info('Hello from js');
  },
});
