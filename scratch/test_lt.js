const localtunnel = require('localtunnel');
(async () => {
  try {
    const tunnel = await localtunnel({ port: 8000 });
    console.log('TUNNEL_SUCCESS_URL:' + tunnel.url);
  } catch (e) {
    console.error(e);
  }
})();
