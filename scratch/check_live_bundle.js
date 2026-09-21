const https = require('https');

https.get('https://truepriv-saas.vercel.app/', (res) => {
  let html = '';
  res.on('data', (c) => { html += c; });
  res.on('end', () => {
    const match = html.match(/src="(\/assets\/[^"]+)"/);
    if (match) {
      const jsUrl = 'https://truepriv-saas.vercel.app' + match[1];
      console.log('Fetching JS URL:', jsUrl);
      https.get(jsUrl, (jsRes) => {
        let js = '';
        jsRes.on('data', (c) => { js += c; });
        jsRes.on('end', () => {
          console.log('JS Size:', js.length);
          console.log('Has "1-Click Multi-Tenant Personas":', js.includes('1-Click Multi-Tenant Personas'));
          console.log('Has "Authorized Workspace Accounts":', js.includes('Authorized Workspace Accounts'));
        });
      });
    } else {
      console.log('No JS bundle matched in HTML:', html);
    }
  });
});
