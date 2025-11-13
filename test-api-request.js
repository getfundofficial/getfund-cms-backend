require('dotenv').config();
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/news',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:5173'
  }
};

console.log('Testing backend API...\n');
console.log(`Request: ${options.method} http://${options.hostname}:${options.port}${options.path}\n`);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  console.log('\nBody:');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const articles = JSON.parse(data);
      console.log(`\n✅ Success! Received ${articles.length} articles\n`);
      articles.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   Date: ${article.published_date || article.date}`);
      });
    } catch (e) {
      console.log('Raw response:', data.substring(0, 500));
      console.error('\n❌ Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
});

req.setTimeout(10000);
req.end();
