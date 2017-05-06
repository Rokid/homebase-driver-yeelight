const Yeelight = require('yeelight2');

const discover = Yeelight.discover(function(light){

  console.log(light.id);
  light.sync()
    .then(console.log)
    // .then(() => light.toggle());



  setTimeout(search, 2000)

});

function search() {
  discover.search('wifi_bulb');
}

setTimeout(search, 2000);