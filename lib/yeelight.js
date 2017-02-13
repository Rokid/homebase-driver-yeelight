const Client = require('node-ssdp').Client;
const EventEmitter = require('events');

const net = require('net');
const socket = new net.Socket();
const client = new Client({ ssdpPort: 1982 });

exports.search = function() {
  return new Promise((resolve) => {
    let lights = [];
    let cb = data => {
      if(!lights.some(item => item.ID === data.ID)) {
        lights.push(data);
      }
    };

    client.on('response', cb);

    client.search('wifi_bulb');

    setTimeout(() => {
      client.removeListener('response', cb);
      resolve(lights);
    }, 5000);
  })
};

exports.control = function(deviceInfo, action) {
  return getConnect(deviceInfo.port, deviceInfo.hostname)
    .then(client => {
      return Object.keys(action).sort(key => key === 'switch' ? -1 : 1).reduce((prev, current) => {
        return (prev === null) ? exec(current) : prev.then(() => exec(current));
      }, null);

      function exec(key) {
        if('switch' === key) {
          if(action[key] === 'on') {
            return client.sendMessage('set_power', ['on', 'smooth', 500]);
          }
          else {
            return client.sendMessage('set_power', ['off', 'smooth', 500]);
          }
        }
        if('color' === key) {
          return client.sendMessage('set_rgb', [action[key], 'smooth', 500]);
        }
        if('brightness' === key) {
          let brightness = Math.max(action[key],1);
          return client.sendMessage('set_bright', [brightness, 'smooth', 500]);
        }
      }
    }
  )
};

exports.getProp = function(deviceInfo) {
  return getConnect(deviceInfo.port, deviceInfo.hostname)
    .then((client) => {
      return client.sendMessage('get_prop', ['power', 'rgb', 'bright']);
  })
};


let clientPool = {
  // '127.0.0.1:9090': {}
};

let reqCount = 1;

function getConnect(port, hostname) {
  return new Promise((resolve, reject) => {
    const poolID = [hostname, port].join(':');

    if (clientPool[poolID]) {
      return resolve(clientPool[poolID]);
    }

    const client = new EventEmitter();
    clientPool[poolID] = client;

    client.socket = socket.connect(port, hostname, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(client);
    });

    client.sendCount = 0;

    client.sendMessage = function(method, params) {
      return new Promise((resolve, reject) => {
        reqCount += 1;
        const req = JSON.stringify({
          method,
          params: params,
          id: reqCount,
        });

        socket.write(`${req}\r\n`, (err) => {
          if (err) {
            reject(err);
          }
        });

        client.sendCount +=1;
        clearTimeout(client.closeTimeout);
        client.once('req_' + reqCount, resolve);
      });
    };

    client.socket.on('data', data => {

      try {
        data = JSON.parse(data);
      }
      catch (err) {
        console.log('data ' + data);
        console.log("data error " + err);
        return;
      }
      client.emit('req_' + data.id, data);
      client.sendCount -= 1;
      if (client.sendCount <= 0) {
        client.closeTimeout = setTimeout(() => {
          client.socket.end();
          clientPool[poolID] = null;
        });
      }
    });
  });
}
