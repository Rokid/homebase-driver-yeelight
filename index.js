/**
 * yeelight Channel
 */

// const transformToRDevice = require('./lib/transform').toRDevice;
const Yeelight = require('yeelight2');

module.exports = function () {

  const lights = [];

  const discover = Yeelight.discover(function(light){
    lights.push(light);
  });

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
     * @param device
     * @param device.deviceId
     * @param device.deviceInfo
     * @param device.state
     * @param device.userAuth
     * @returns {PromiseLike<>|Promise.<>}
     */
    get(device) {
      const light = findLight(device.deviceId);

      if (!light) {
        return Promise.reject(new Error('no light'));
      } else {
        return light.sync().then(() => transform(light))
      }
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
      const light = findLight(device.deviceId);

      if (!light) {
        return Promise.reject(new Error('no device'));
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
  let actions, name, state;
  switch(light.color_mode) {
    case '2':
      actions =  {
        switch: ['on', 'off'],
        brightness: ['num']
      };

      name = light.name || '白光灯泡';
      state = {
        switch: light.power,
        brightness: parseInt(light.bright)
      };
      break;
    case '1':
      actions =  {
        switch: ['on', 'off'],
        color: ['num']
      };

      name = light.name || '白光灯泡';
      state = {
        switch: light.power,
        color: parseInt(light.rgb)
      };
      break;
  }
  return {
    type: 'light',
    name: name,
    deviceId: light.id,
    state: state,
    actions: actions
  }
}