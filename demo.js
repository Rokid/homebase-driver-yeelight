const d = require('./index')()


let on = false;
let lights;
function search() {
  d.list()
    .then((devices) => {
      console.log('found light ======>')
      if (!lights) {
        lights = devices;
        onLightFound();
      } else {
        lights = devices;
      }
    })
    .catch(err => {
      console.error(err);
    })
}

setInterval(search, 15000)


function onLightFound() {
  lights.forEach((light) => {
    d
      .execute(light, {property: 'switch', name: 'on'})
      .catch(err=>console.log(err))
  })
}


setInterval(() => {
  if (!lights) {
    return;
  }
  on = !on;
  lights.forEach((light) => {
    d.execute(light, {property: 'brightness', name: 'num', value: on ? 10 : 90})
      .catch(err=>console.log(err))
  })
}, 2000)
