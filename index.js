/**
 * yeelight Channel
 */

// const transformToRDevice = require('./lib/transform').toRDevice;
const Yeelight = require('yeelight2');
const Packet = require('ssdp2/packet.js');

const parse = Packet.parse;

Packet.parse = function(data) {
  console.log(JSON.stringify(data.toString()));
  return parse.call(Packet, data);
}

const models = {
  'mono': 'Yeelight 白光灯泡',
  'desklamp': '米家台灯',
  'color': 'Yeelight 彩光灯泡',
  'stripe': 'Yeelight 灯带'
};
function printLight(light) {
  console.log('light', light.id);
  console.log('  light address ', light.socket.remoteAddress);
  console.log('  light model', light.model);
}

module.exports = function () {

  const lights = [];

  console.info('yeelight start search new light');
  const discover = Yeelight.discover(function(light, response) {
    light.model = response.headers.model;
    light.supports = response.headers.support ? response.headers.support.split(' ') : [];
    console.info('find new light');
    printLight(light);
    lights.push(light);
  });

  setTimeout(() => {
    discover.search('wifi_bulb');
  }, 5000);

  function findLight(deviceId) {
    return lights.find(light => light.id === deviceId);
  }

  return {
    /**
     * @returns {PromiseLike<>|Promise.<>}
     */
    list() {
      return new Promise(function(resolve, reject){
        discover.search('wifi_bulb');
        setTimeout(function() {
          Promise.all(lights.map(light => light.sync()))
            .then(() => lights.map(transform).filter(d => d))
            .then(resolve, reject);
        }, 5000);
      });
    },

    /**
     * 设置状态
     * @param device
     * @param device.deviceId
     * @param device.deviceInfo
     * @param device.userAuth
     * @param device.state
     * @param action
     * @param action.property
     * @param action.name
     * @param action.value
     * @return {Promise}
     */
    execute(device, action) {
      let light = findLight(device.deviceId);

      if (!light) {
        console.log('error when execute');
        lights.forEach(printLight);
        if (device.deviceInfo && device.deviceInfo.address) {
          light = new Yeelight(device.deviceInfo.address, device.devicerInfo.port);
        } else {
          return Promise.reject(new Error('no device'));
        }
      }

      if (action.property === 'color' && action.name === 'num') {
        return light.set_rgb(action.value)
          .then(() => light.sync())
          .then(() => transform(light))
          .then((device) => device.state)
      }

      if (action.property === 'brightness' && action.name === 'num') {
        return light.set_bright(action.value)
          .then(() => light.sync())
          .then(() => transform(light))
          .then((device) => device.state)
      }

      if (action.property === 'switch') {
        return light.set_power(action.name)
          .then(() => light.sync())
          .then(() => transform(light))
          .then((device) => device.state)
      }

    }
  }
};



function transform(light) {
  const name = light.name || models[light.model] || 'Yeelight 灯';

  const actions =  {
    switch: ['on', 'off']
  };
  const state = {};

  const isRGB = light.supports.indexOf('set_rgb') > -1;

  if (isRGB) {
    actions.color = ['num'];
    state.color = parseInt(light.rgb, 10);
  } else if (light.supports.indexOf('set_bright') > -1) {
    actions.brightness = ['num'];
    state.brightness = parseInt(light.bright, 10);
  }


  return {
    type: 'light',
    name: name,
    deviceId: light.id,
    deviceInfo: {
      address: light.socket.remoteAddress,
      port: light.socket.remotePort
    },
    state: state,
    actions: actions
  }
}