/**
 * yeelight Channel
 */

const transformToRDevice = require('./lib/transform').toRDevice;
const yeelight = require('./lib/yeelight');

module.exports = function () {

  return {
    /**
     * @returns {PromiseLike<>|Promise.<>}
     */
    list() {
      return yeelight.search()
        .then(lights => lights.map(light => transformToRDevice(light)));
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
      return yeelight.getProp(device.deviceInfo)
        .then(data => {
          const state = data.result;
          const currentState = {
            switch: state[0],
            color: state[1],
            brightness: state[2]
          };
          device.state =  Object.assign({}, device.state, currentState);
          return device;
        })
    },

    /**
     * 设置状态
     * @param device
     * @param device.deviceId
     * @param device.deviceInfo
     * @param device.userAuth
     * @param device.state
     * @param action
     * @return {Promise}
     */
    execute(device, action) {

      const finalState = Object.assign({}, device.state, action);

      return yeelight.control(device.deviceInfo, action)
        .then(() => finalState);
    }
  }
};