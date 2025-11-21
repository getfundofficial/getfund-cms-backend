const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoint: GET /api/pages/home/sections/page_content\n');

    const response = await fetch('http://localhost:5000/api/pages/home/sections/page_content');
    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.section && data.section.content) {
      console.log('\n--- Content Analysis ---');
      console.log('Section ID:', data.section.id);
      console.log('Section Key:', data.section.section_key);
      console.log('Section Type:', data.section.section_type);
      console.log('Content keys:', Object.keys(data.section.content));

      if (data.section.content.heroSlides) {
        console.log('\nHero Slides Count:', data.section.content.heroSlides.length);
        data.section.content.heroSlides.forEach((slide, idx) => {
          console.log(`  Slide ${idx + 1}: ${slide.headline}`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
