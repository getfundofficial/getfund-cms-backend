const http = require('http');

console.log('Testing API response time...\n');

const start = Date.now();
const req = http.get('http://localhost:5000/api/news', (res) => {
  const duration = Date.now() - start;
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Time: ${duration}ms`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const articles = JSON.parse(data);
      console.log(`Articles: ${articles.length}`);
      process.exit(0);
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.setTimeout(15000, () => {
  console.error('Request timed out after 15 seconds');
  req.destroy();
  process.exit(1);
});
