const https = require("https");

const url = "https://www.getfund.gov.gh/2026/01/23/chass-leadership-engages-getfund-administrator/";

https.get(url, { timeout: 30000 }, (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    // Find all unique images
    const imgRegex = /https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
    const allImages = [...new Set(data.match(imgRegex) || [])];

    // Filter out logos
    const validImages = allImages.filter(img => {
      const l = img.toLowerCase();
      const isLogo = l.includes("logo") ||
             l.includes("site-icon") ||
             l.includes("cropped-getfund") ||
             l.includes("favicon") ||
             /-150x150\./.test(l) ||
             /-170x170\./.test(l);
      return !isLogo;
    });

    console.log("Valid article images:");
    validImages.forEach((m, i) => console.log("  " + (i+1) + ". " + m));
  });
});
