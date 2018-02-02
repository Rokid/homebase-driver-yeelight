const Packet = require('ssdp2/packet.js');

const parse = Packet.parse;
// const code = "M-SEARCH * HTTP/1.1\r\nHOST:239.255.255.250:1982\r\nMAN:\"ssdp:discover\"\r\nST:wifi_bulb\r\n"
const code = "HTTP/1.1 200 OK\r\nCache-Control: max-age=3600\r\nDate: \r\nExt: \r\nLocation: yeelight://192.168.2.117:55443\r\nServer: POSIX UPnP/1.0 YGLC/1\r\nid: 0x0000000002dfa672\r\nmodel: color\r\nfw_ver: 56\r\nsupport: get_prop set_default set_power toggle set_bright start_cf stop_cf set_scene cron_add cron_get cron_del set_ct_abx set_rgb set_hsv set_adjust set_music set_name\r\npower: off\r\nbright: 100\r\ncolor_mode: 1\r\nct: 4000\r\nrgb: 328965\r\nhue: 359\r\nsat: 100\r\nname: \r\n";

parse(code);