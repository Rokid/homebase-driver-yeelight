const d = require('./index')()

  d.list()
  .then((devices) => {
    console.log(devices);
    d.execute(devices[0], {property: 'brightness', name: 'num', value: 100})
  });