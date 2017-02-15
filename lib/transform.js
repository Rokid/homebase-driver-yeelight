/**
 * 设备标准化
 * @param device
 * @return {Object}
 */

const url = require('url');
const yeelight = require('./yeelight');

exports.toRDevice = function (device) {

  const parsedUri = url.parse(device.LOCATION);

  let state = {
    switch:device.POWER === 'on' ? 'on' : 'off',
    brightness:device.BRIGHT
  };
  let actions = {
    switch:['on', 'off'],
    brightness: ['up', 'down', 'max', 'min', 'num']
  };

  if (device.MODEL === 'color') {
    state = Object.assign({}, state, {
      color: device.RGB
    });

    actions = Object.assign({}, actions, {
      color: ['random', 'color']
    })
  }

  let name = device.NAME;

  if (device.NAME) {
    name = device.NAME;
  } else if (device.MODEL === 'color') {
    name = '彩光灯泡';
  } else if (device.MODEL === 'mono') {
    name = '白光灯泡';
  } 

  return {
    type: 'light',
    name: name,
    deviceId: device.ID,
    deviceInfo: {
      hostname: parsedUri.hostname,
      port: parsedUri.port
    },
    state: state,
    actions: actions
  };

};
