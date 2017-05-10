const Yeelight = require('yeelight2');

const discover = Yeelight.discover(function(light, response){

  light.sync()
    .then(() => {
      console.log(light.id, light.color_mode, light.name, light.connected, response.headers.model);
    });

  setTimeout(search, 2000)

});

function search() {
  discover.search('wifi_bulb');
}

setTimeout(search, 2000);