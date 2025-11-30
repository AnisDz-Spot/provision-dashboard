// Retry POST to /api/temp-supabase-creds until server ready
(async () => {
  const endpoint = 'http://localhost:3000/api/temp-supabase-creds';
  const payload = { url: 'https://myproject.supabase.co', anonKey: 'public-anon-key' };

  // Node's global fetch is available on Node 18+. Try to fall back to node-fetch if needed.
  let fetchFn = global.fetch;
  if (!fetchFn) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      fetchFn = require('node-fetch');
    } catch (e) {
      console.error('No fetch available. Please run on Node 18+ or install node-fetch.');
      process.exit(2);
    }
  }

  const maxAttempts = 15;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt}: POST ${endpoint}`);
      const res = await fetchFn(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Status:', res.status);

      // Print headers
      try {
        const headersObj = {};
        for (const [k, v] of res.headers) headersObj[k] = v;
        console.log('Headers:', headersObj);
      } catch (hdrErr) {
        console.log('Could not enumerate headers:', hdrErr.message || hdrErr);
      }

      const text = await res.text();
      console.log('Body:', text);
      process.exit(res.ok ? 0 : 1);
    } catch (err) {
      console.log(`Attempt ${attempt} failed: ${err.message || err}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.error(`No response after ${maxAttempts} attempts`);
  process.exit(1);
})();
