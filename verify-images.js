const fs = require('fs');
const path = require('path');

// Images the API returns (from the curl output)
const apiImages = [
  '/images/news/getfund-deputy-administrator-fires-investigation.png',
  '/images/news/getfund-deputy-administrator-fires-investigation.png',
  '/images/news/news-placeholder.svg',
  '/images/news/getfund-administrator-engages-chass-leadership.jpg',
  '/images/news/getfund-receives-delegation-from-university-of-virgin-island.jpg',
  '/images/news/fueltrade-supports-getfund-81d8a552-07de-4243-86cb-e1e131f81bae.jpg',
  '/images/news/getfund-accelerates-practical-science-education-wi-e9037f5d-caa2-43d1-ac14-d1b850e4e1ef.png',
  '/images/news/getfund-supports-ghana-national-research-fund-with-236d3784-b3bc-491a-aa51-e9a1c255fbe5.png',
  '/images/news/2026-budget-getfund-drives-historic-expansion-in-e-9f0d945b-2680-410f-a824-af245f70c344.jpg',
  '/images/news/getfund-to-commit-ghc-50-million-yearly-to-free-te-c8c3df0f-98a4-4243-8b78-f07c2b968d7e.png',
  '/images/news/ceo-of-students-loan-trust-fund-visits-getfund-adm-e5ed33ac-1899-4497-8bf1-191b465f1abd.jpg',
  '/images/news/getfund-kicks-off-multi-project-construction-in-no-9c335f51-554f-4ec9-a8b3-853c33d62b1f.png',
  '/images/news/getfund-gives-greenlight-for-the-construction-of-u-a37da37c-5957-4198-b3de-fa55d120726e.png',
  '/images/news/n-r-getfund-launches-major-infrastructure-expansio-3189c29f-1ea7-44a3-8033-638f63994d1f.png',
  '/images/news/getfund-commences-accelerated-infrastructure-progr-9686a8ad-af4d-404a-b97a-c894fe29883a.png',
  '/images/news/n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs.png',
  '/images/news/getfund-administrator-meets-with-staff.jpg',
  '/images/news/director-general-of-prisons-engages-getfund-on-inmate-rehabi.jpg',
  '/images/news/getfund-engages-with-voorhees-university-and-attraco-to-deep.jpg',
  '/images/news/strengthening-educational-ties-getfund-monitors-scholars-in-.jpg',
  '/images/news/photo-gallery-getfund-tours-uk-universities-to-engage-ghanai.jpg',
  '/images/news/minister-of-education-inaugurates-7th-getfund-board.jpg',
  '/images/news/getfund-holds-orientation-workshop-for-7th-board-of-trustees.jpg',
  '/images/news/getfund-scholarship-unit-engages-with-university-of-cape-coa.png',
  '/images/news/gaf-cds-interacts-with-getfund-administrator.png',
  '/images/news/getfund-administrator-engages-media-in-kumasi.jpg',
  '/images/news/advocacy-for-private-sector-led-school-infrastructure-develo.jpg',
  '/images/news/mr-paul-adjei-assumes-office-as-getfund-administrator.jpg',
  '/images/news/state-award-for-outstanding-public-service.jpg',
  '/images/news/getfund-inaugurates-a-four-storey-headquarters-building.jpg',
  '/images/news/2024-trinity-theological-seminary-graduation.jpg',
  '/images/news/getfund-grants-scholarships-to-gtp-finalists.jpg',
  '/images/news/getfund-administrator-counsels-tertiary-institutions-on-fina.jpg',
  '/images/news/scholarship-processes-at-getfund-have-improved.jpg',
  '/images/news/the-administrator-urges-universities-to-be-innovat-33bfd95d-8cec-40ed-9b15-b6afa7ec77ad.jpg',
  '/images/news/government-grants-new-scholarships-to-4-279-local-tertiary-s.jpeg',
  '/images/news/getfund-has-not-used-its-receivables-to-borrow-1-5-billion.jpg',
  '/images/news/voorhees-university-delegation-calls-on-getfund.jpg',
  '/images/news/carleton-university-pays-courtesy-call-on-getfund.jpg',
  '/images/news/military-high-command-pays-courtesy-call-on-getfund-administ.jpg',
  '/images/news/delegation-from-heslb-tanzania-visits-getfund.jpg',
  '/images/news/getfund-administrator-interacts-with-nugs-leadership.jpg',
  '/images/news/getfund-2022-23-local-scholarship-application.jpg',
  '/images/news/universities-fund-kenya-understudies-getfund.jpg',
  '/images/news/getfund-accounts-to-the-public-stakeholder-forum.jpg',
  '/images/news/getfund-administrator-inspects-uds-project.jpg',
  '/images/news/getfund-administrator-pays-working-visit.jpg',
  '/images/news/getfund-board-of-trustees-tour-project.jpg',
  '/images/news/vice-president-hands-over-buses-and-pickups.jpg',
  '/images/news/daakye-trust-plc-holds-inaugural-agm-in-accra.jpg',
  '/images/news/getfund-s-bold-march-on-educational-infrastructure.jpg',
  '/images/news/getfund-obtains-parliamentary-nod.jpg',
  '/images/news/press-update-infrastructure-projects.png',
  '/images/news/getfund-completes-1st-quarter-project-monitoring-in-volta-re.jpg',
  '/images/news/2021-scholarship-monitoring-programme.jpg',
  '/images/news/sona-2020-on-educational-infrastructure.jpg',
];

const imagesDir = path.join(__dirname, '../getfund-website/public/images/news');
const actualImages = fs.readdirSync(imagesDir);

console.log('Checking API images against local files...\n');

let missing = 0;
const missingFiles = [];

for (const imgPath of apiImages) {
  const filename = imgPath.replace('/images/news/', '');
  if (!actualImages.includes(filename)) {
    console.log('MISSING:', filename);
    missingFiles.push(filename);
    missing++;
  }
}

console.log('\n---');
console.log('Total API images:', apiImages.length);
console.log('Missing locally:', missing);

if (missing === 0) {
  console.log('\nAll API images exist locally!');
}
