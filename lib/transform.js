/**
 * 设备标准化
 * @param device
 * @return {Object}
 */

const url = require('url');
const yeelight = require('./yeelight');

exports.toRDevice = function (device) {

  const parsedUri = url.parse(device.LOCATION);

  return {
    type: 'light',
    name: device.NAME,
    deviceId: device.ID,
    deviceInfo: {
      hostname: parsedUri.hostname,
      port: parsedUri.port
    },
    state: {
      switch:device.POWER === 'on' ? 'on' : 'off',
      color: device.RGB,
      brightness:device.BRIGHT
    },
    actions: {
      switch:['on', 'off'],
      color: ['random', 'color'],
      brightness: ['up', 'down', 'max', 'min', 'num']
    }
  };

};
