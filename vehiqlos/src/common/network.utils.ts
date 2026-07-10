import * as os from 'os';

export function getLocalIpAndMac() {
  const interfaces = os.networkInterfaces();
  let ip = '127.0.0.1';
  let mac = '01:23:45:67:89:ab'; // valid fallback MAC address

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      // Skip internal (loopback) and non-ipv4 addresses
      if (!net.internal && net.family === 'IPv4') {
        ip = net.address;
        if (net.mac && net.mac !== '00:00:00:00:00:00') {
          mac = net.mac;
        }
        break;
      }
    }
    if (ip !== '127.0.0.1') break;
  }
  return { ip, mac };
}
