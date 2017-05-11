const Yeelight = require('yeelight2');

const discover = Yeelight.discover(function(light, response){

  light.sync()
    .then((info) => {
      console.log(response.headers.model);
      console.log(info);
    });

  setTimeout(search, 2000)

});

function search() {
  console.log('search wifi_bulb');
  discover.search('wifi_bulb');
}

setTimeout(search, 2000);