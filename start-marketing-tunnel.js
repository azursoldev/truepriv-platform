const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5000, subdomain: 'truepriv-pricing-live' });
    console.log('MARKETING_TUNNEL_SUCCESS_URL:' + tunnel.url);

    tunnel.on('close', () => {
      console.log('Marketing tunnel closed');
    });

    tunnel.on('error', (err) => {
      console.error('Marketing tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to create marketing tunnel:', err);
  }
})();
