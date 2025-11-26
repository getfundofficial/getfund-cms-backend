require('dotenv').config();
const { sql } = require('@vercel/postgres');

/**
 * Migration Script: Transfer Hardcoded Fundraising Content to CMS
 *
 * This script populates the CMS database with all the content from the
 * hardcoded fundraising pages (Why Fundraising, Ways to Donate, Partnerships,
 * Beneficiaries Give Back, Events)
 */

async function migrateFundraisingContent() {
  try {
    console.log('🚀 Starting migration of fundraising content to CMS...\n');

    // ==============================================
    // 1. WHY FUNDRAISING PAGE
    // ==============================================
    console.log('1️⃣ Migrating: Why Fundraising...');

    const whyFundraisingContent = {
      tabs: [
        {
          heading: 'Hero Section',
          content: `
            <h1 class="text-4xl md:text-5xl font-bold mb-6">Why Fundraising?</h1>
            <p class="text-xl md:text-2xl mb-8 leading-relaxed">
              Your support helps us expand access to quality education through infrastructure, scholarships, and partnerships that change lives.
            </p>
          `
        },
        {
          heading: 'Main Content',
          content: `
            <p class="text-lg text-gray-700 leading-relaxed">
              At the Ghana Education Trust Fund (GETFund), fundraising is a strategic pillar of our commitment to expanding access to quality education for all. While statutory allocations remain essential, the growing needs of schools, communities, and learners across the country call for broader partnerships, innovative financing models, and shared responsibility. Through purposeful resource mobilization from individuals, corporate partners, development agencies, and philanthropic organizations, GETFund strengthens and diversifies support for educational infrastructure, scholarships, teaching and learning resources, and other vital interventions. In this work, we are guided by a long-term ambition to drive sustainable education financing and foster impactful partnerships that advance equity, improve learning outcomes, and build a stronger future for Ghana.
            </p>
          `
        },
        {
          heading: 'Why Donate to Us - Give with Confidence',
          content: `
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Donate to Us - Give with Confidence
            </h2>

            <div class="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Imagine a brilliant young student in Ghana, eager to learn and full of potential. Now, imagine their classroom is the shade of a tree, or a room so crowded they can barely move. Imagine they have no textbook to read and no electricity to study by at night. For countless children, this is not imagination; it is their reality. Their dreams are put on hold simply because their families cannot afford the cost of education.
              </p>

              <p>
                The Ghana Education Trust Fund (GETFund) was created to rewrite this story. Your gift can become the four walls of a safe classroom, the desk a child can call their own, or the scholarship that turns a dream into a degree. Together, we can provide the tools and opportunities that allow these bright minds to grow and thrive.
              </p>

              <p>
                Your trust is our priority. GETFund is committed to the highest standards of accountability, with transparent financial systems and audited reports under government supervision. The impact of your generosity is clear to see in the schools, ICT labs, and libraries we have built, and in the success of the students we have sponsored. Help us empower the next generation, transforming education brick by brick, one child at a time.
              </p>
            </div>
          `
        },
        {
          heading: 'Get Involved',
          content: `
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Get Involved
            </h2>

            <p class="text-lg text-gray-700 leading-relaxed mb-8 text-center">
              Every contribution, irrespective of the amount, brings us closer to ensuring that no child in Ghana is left behind because of inadequate facilities or financial barriers.
            </p>
          `
        }
      ]
    };

    await sql`
      UPDATE page_sections
      SET content = ${JSON.stringify(whyFundraisingContent)}::jsonb,
          updated_at = NOW()
      WHERE page_id = (SELECT id FROM pages WHERE slug = 'why-fundraising')
        AND section_type = 'page_content'
    `;
    console.log('   ✓ Why Fundraising content migrated\n');

    // ==============================================
    // 2. WAYS TO DONATE PAGE
    // ==============================================
    console.log('2️⃣ Migrating: Ways to Donate...');

    const waysToDonateContent = {
      tabs: [
        {
          heading: 'Hero Section',
          content: `
            <h1 class="text-4xl md:text-5xl font-bold mb-6">
              Investing in Education. Building Ghana's Tomorrow.
            </h1>
            <p class="text-lg md:text-xl leading-relaxed">
              The Ghana Education Trust Fund (GETFund) is committed to advancing education through sustainable investment in infrastructure and human capital. From modern school infrastructure to life-changing scholarships, your generosity strengthens the foundation of learning for generations to come. With every gift, you help transform potential into progress - and ensure every child has a place to learn and a chance to thrive.
            </p>
          `
        },
        {
          heading: 'Ways You Can Donate',
          content: `
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              There are many ways you can donate and support:
            </h2>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Classroom construction support</h3>
                <p class="text-gray-700 mb-4">Imagine children clustered under a leaking roof, or found under trees, rain soaking their notebooks. Your gift builds a bright, safe classroom where dreams can finally take root.</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Student Scholarship (Local)</h3>
                <p class="text-gray-700 mb-4">She's brilliant, but poverty whispers "quit" every day. Your support silences that voice and hands her the key to a university degree.</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Student Scholarship (International)</h3>
                <p class="text-gray-700 mb-4">He dreams of studying abroad, yet the cost feels like a locked door; your kindness swings it wide open for a life-changing opportunity.</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">School Meals</h3>
                <p class="text-gray-700 mb-4">An empty stomach steals focus and hope. Your meal fills a hungry child with energy, joy, and the promise of a brighter tomorrow.</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Classroom Furniture</h3>
                <p class="text-gray-700 mb-4">Picture kids sitting on bare floors with aching backs. Your desks and chairs give them comfort, dignity, and the simple joy of learning with pride.</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Learning Materials</h3>
                <p class="text-gray-700 mb-4">Without books, a teacher's voice fades into silence. Your textbooks ignite curiosity and turn "I can't" into "I will!".</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">ICT & Digital Learning Tools</h3>
                <p class="text-gray-700 mb-4">In a world racing ahead, these children risk being left behind. Your computers and tablets connect them to endless possibilities.</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">School Sanitation & Water Access</h3>
                <p class="text-gray-700 mb-4">No clean water, no safe toilet, girls miss school, dignity crumbles. Your gift brings flowing water and hope that keeps every child in class.</p>
              </div>
            </div>
          `
        },
        {
          heading: 'Other Ways of Donating',
          content: `
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">
              Other ways of donating
            </h2>

            <div class="grid md:grid-cols-2 gap-8">
              <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Send a Cheque</h3>
                <p class="text-gray-700">(mailing instructions to be included)</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Donate with Mobile Money</h3>
                <p class="text-gray-700">(shortcode, networks, etc)</p>
              </div>
            </div>
          `
        },
        {
          heading: 'Give with Confidence',
          content: `
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Give with Confidence
            </h2>
            <p class="text-lg text-gray-700 leading-relaxed text-center">
              Your trust is our priority. GETFund is committed to the highest standards of accountability, with transparent financial systems and audited reports under government supervision. The impact of your generosity is evident in the schools, ICT labs, and libraries we have built, as well as in the success of the students we have sponsored. Help us empower the next generation, transforming education brick by brick, one child at a time.
            </p>
          `
        }
      ]
    };

    await sql`
      UPDATE page_sections
      SET content = ${JSON.stringify(waysToDonateContent)}::jsonb,
          updated_at = NOW()
      WHERE page_id = (SELECT id FROM pages WHERE slug = 'ways-to-donate')
        AND section_type = 'page_content'
    `;
    console.log('   ✓ Ways to Donate content migrated\n');

    // ==============================================
    // 3. PARTNERSHIPS PAGE
    // ==============================================
    console.log('3️⃣ Migrating: Partnerships...');

    const partnershipsContent = {
      tabs: [
        {
          heading: 'Hero Section',
          content: `
            <h1 class="text-4xl md:text-5xl font-bold mb-6">Partnerships</h1>
            <p class="text-xl md:text-2xl mb-8 leading-relaxed">
              Together, we can transform education in Ghana through strategic partnerships and shared commitment.
            </p>
          `
        },
        {
          heading: 'Partnership Opportunities',
          content: `
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Partnership Opportunities
            </h2>

            <p class="text-lg text-gray-700 leading-relaxed mb-8">
              GETFund welcomes partnerships with organizations, institutions, and individuals who share our vision of quality education for all Ghanaians. Whether through corporate social responsibility initiatives, development partnerships, or collaborative projects, together we can make a lasting impact.
            </p>

            <div class="grid md:grid-cols-2 gap-8 mb-12">
              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">Corporate Partnerships</h3>
                <p class="text-gray-700">
                  Partner with us to align your corporate social responsibility goals with meaningful educational outcomes. From infrastructure development to scholarship programs, your company can make a tangible difference in communities across Ghana.
                </p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">Development Partners</h3>
                <p class="text-gray-700">
                  Join international development agencies and foundations in supporting Ghana's educational transformation. We welcome collaborative projects that enhance infrastructure, capacity building, and innovative learning solutions.
                </p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">Academic Institutions</h3>
                <p class="text-gray-700">
                  Universities and research institutions can partner with us on knowledge exchange, research initiatives, and capacity development programs that strengthen Ghana's education sector.
                </p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">Community Organizations</h3>
                <p class="text-gray-700">
                  Local NGOs and community-based organizations bring valuable insights and on-the-ground expertise. Partner with us to ensure educational interventions are community-driven and sustainable.
                </p>
              </div>
            </div>

            <h3 class="text-2xl font-bold text-gray-900 mb-4">Why Partner with GETFund?</h3>
            <ul class="space-y-3 text-lg text-gray-700 list-disc list-inside mb-8">
              <li>Proven track record of successful educational infrastructure projects across Ghana</li>
              <li>Transparent governance and accountability frameworks</li>
              <li>National reach with strong community connections</li>
              <li>Professional project management and monitoring systems</li>
              <li>Alignment with Ghana's national education priorities</li>
            </ul>

            <p class="text-lg text-gray-700 leading-relaxed">
              To explore partnership opportunities, please contact our Partnerships Team. We look forward to working together to build a brighter future for Ghana's children.
            </p>
          `
        }
      ]
    };

    await sql`
      UPDATE page_sections
      SET content = ${JSON.stringify(partnershipsContent)}::jsonb,
          updated_at = NOW()
      WHERE page_id = (SELECT id FROM pages WHERE slug = 'partnerships')
        AND section_type = 'page_content'
    `;
    console.log('   ✓ Partnerships content migrated\n');

    // ==============================================
    // 4. BENEFICIARIES GIVE BACK PAGE
    // ==============================================
    console.log('4️⃣ Migrating: Beneficiaries Give Back...');

    const beneficiariesContent = {
      tabs: [
        {
          heading: 'Hero Section',
          content: `
            <h1 class="text-4xl md:text-5xl font-bold mb-6">Beneficiaries Give Back</h1>
            <p class="text-xl md:text-2xl mb-8 leading-relaxed">
              Your success story can inspire the next generation. Give back and help others achieve their dreams.
            </p>
          `
        },
        {
          heading: 'Main Message',
          content: `
            <div class="max-w-3xl mx-auto text-center">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                You've Been Blessed. Now Bless Others.
              </h2>

              <p class="text-lg text-gray-700 leading-relaxed mb-8">
                If you benefited from GETFund support - whether through a scholarship, improved school facilities, or educational resources - you understand firsthand the power of educational opportunity. Your success is a testament to what's possible when barriers are removed and potential is unlocked.
              </p>

              <p class="text-lg text-gray-700 leading-relaxed mb-8">
                Now it's your turn to pay it forward. Your contribution, no matter the size, can open doors for the next brilliant student, fund the next classroom, or provide the next scholarship that changes a life.
              </p>

              <div class="bg-blue-50 p-8 rounded-lg mb-8">
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">How You Can Give Back</h3>
                <ul class="space-y-3 text-left text-lg text-gray-700">
                  <li class="flex items-start">
                    <span class="text-getfund-primary mr-3">•</span>
                    <span>Make a one-time or recurring donation</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-getfund-primary mr-3">•</span>
                    <span>Sponsor a student's education</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-getfund-primary mr-3">•</span>
                    <span>Support infrastructure projects in your home region</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-getfund-primary mr-3">•</span>
                    <span>Volunteer your expertise and mentorship</span>
                  </li>
                </ul>
              </div>

              <p class="text-xl text-gray-900 font-semibold mb-6">
                Together, let's ensure that every child in Ghana has the same opportunities you had.
              </p>

              <p class="text-lg text-gray-700 leading-relaxed">
                Your gift today honors the investment that was made in you and creates a ripple effect of educational transformation across Ghana.
              </p>
            </div>
          `
        }
      ]
    };

    await sql`
      UPDATE page_sections
      SET content = ${JSON.stringify(beneficiariesContent)}::jsonb,
          updated_at = NOW()
      WHERE page_id = (SELECT id FROM pages WHERE slug = 'beneficiaries-give-back')
        AND section_type = 'page_content'
    `;
    console.log('   ✓ Beneficiaries Give Back content migrated\n');

    // ==============================================
    // 5. EVENTS PAGE
    // ==============================================
    console.log('5️⃣ Migrating: Events...');

    const eventsContent = {
      tabs: [
        {
          heading: 'Hero Section',
          content: `
            <h1 class="text-4xl md:text-5xl font-bold mb-6">Fundraising Events</h1>
            <p class="text-xl md:text-2xl mb-8 leading-relaxed">
              Join us at upcoming events and be part of Ghana's education transformation.
            </p>
          `
        },
        {
          heading: 'Events Content',
          content: `
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Upcoming Fundraising Events
            </h2>

            <p class="text-lg text-gray-700 leading-relaxed mb-8 text-center max-w-3xl mx-auto">
              GETFund hosts various events throughout the year to engage with supporters, showcase our impact, and raise funds for educational projects. Check back regularly for updates on upcoming events.
            </p>

            <div class="bg-gray-50 p-8 rounded-lg text-center">
              <p class="text-xl text-gray-600 mb-6">
                No events scheduled at this time.
              </p>
              <p class="text-lg text-gray-700">
                Subscribe to our newsletter to be notified about upcoming fundraising events and opportunities to get involved.
              </p>
            </div>

            <div class="mt-12 max-w-3xl mx-auto">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Types of Events We Host</h3>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h4 class="text-xl font-semibold text-gray-900 mb-3">Gala Dinners</h4>
                  <p class="text-gray-700">Annual fundraising galas bringing together stakeholders, donors, and education champions.</p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h4 class="text-xl font-semibold text-gray-900 mb-3">Community Walkathons</h4>
                  <p class="text-gray-700">Fun, family-friendly walks that raise awareness and funds for educational projects.</p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h4 class="text-xl font-semibold text-gray-900 mb-3">Corporate Partnerships Events</h4>
                  <p class="text-gray-700">Networking events connecting corporate partners with education impact opportunities.</p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h4 class="text-xl font-semibold text-gray-900 mb-3">Alumni Gatherings</h4>
                  <p class="text-gray-700">Special events for GETFund beneficiaries to reconnect and give back.</p>
                </div>
              </div>
            </div>
          `
        }
      ]
    };

    await sql`
      UPDATE page_sections
      SET content = ${JSON.stringify(eventsContent)}::jsonb,
          updated_at = NOW()
      WHERE page_id = (SELECT id FROM pages WHERE slug = 'events')
        AND section_type = 'page_content'
    `;
    console.log('   ✓ Events content migrated\n');

    // ==============================================
    // VERIFICATION
    // ==============================================
    console.log('\n6️⃣ Verifying migration...\n');

    const verification = await sql`
      SELECT p.slug, p.title,
             (SELECT jsonb_array_length(ps.content->'tabs')
              FROM page_sections ps
              WHERE ps.page_id = p.id
                AND ps.section_type = 'page_content') as tab_count
      FROM pages p
      WHERE p.parent_page_id IN (SELECT id FROM pages WHERE slug = 'fundraising')
      ORDER BY p.menu_order
    `;

    console.log('Verification Results:');
    console.log('====================');
    verification.rows.forEach(row => {
      console.log(`✓ ${row.title} (${row.slug}): ${row.tab_count || 0} content tabs`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Visit CMS admin: http://localhost:5174/admin/pages');
    console.log('2. Edit any fundraising page to see the migrated content');
    console.log('3. Update App.tsx to use CMSPageComponent for fundraising routes');
    console.log('4. Test pages on website: http://localhost:5175/fundraising/[page-slug]');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateFundraisingContent();
