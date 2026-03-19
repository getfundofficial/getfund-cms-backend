export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Cache for holidays to avoid repeated API calls
const holidayCache: Map<number, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Eid ul-Fitr and Eid ul-Adha dates by year (astronomical estimates).
 * Islamic holidays follow the lunar calendar and shift ~11 days earlier each year.
 * Each entry is [month, day] for the first day of the holiday (2 days observed in Ghana).
 */
const eidDates: Record<number, { fitr: [number, number]; adha: [number, number] }> = {
  2024: { fitr: [4, 10], adha: [6, 17] },
  2025: { fitr: [3, 30], adha: [6, 6] },
  2026: { fitr: [3, 20], adha: [5, 27] },
  2027: { fitr: [3, 9], adha: [5, 16] },
  2028: { fitr: [2, 27], adha: [5, 4] },
  2029: { fitr: [2, 15], adha: [4, 24] },
  2030: { fitr: [2, 4], adha: [4, 13] },
  2031: { fitr: [1, 24], adha: [4, 2] },
  2032: { fitr: [1, 14], adha: [3, 21] },
  2033: { fitr: [1, 2], adha: [3, 11] },
  2034: { fitr: [12, 22], adha: [2, 28] },
  2035: { fitr: [12, 12], adha: [2, 17] },
};

/**
 * Ghana Public Holidays
 * Includes fixed holidays, calculated Easter dates, Eid holidays, and Farmer's Day
 */
function getGhanaHolidays(year: number) {
  // Calculate Easter Sunday using Anonymous Gregorian algorithm
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easterSunday = new Date(year, month - 1, day);
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);

  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Farmer's Day: first Friday of December
  const dec1 = new Date(year, 11, 1);
  const dec1Day = dec1.getDay(); // 0=Sun, 5=Fri
  const farmersDay = new Date(year, 11, 1 + ((5 - dec1Day + 7) % 7));

  const holidays = [
    { date: `${year}-01-01`, name: "New Year's Day", type: 'public' },
    { date: `${year}-01-07`, name: 'Constitution Day', type: 'public' },
    { date: `${year}-03-06`, name: 'Independence Day', type: 'public' },
    { date: formatDate(goodFriday), name: 'Good Friday', type: 'public' },
    { date: formatDate(easterMonday), name: 'Easter Monday', type: 'public' },
    { date: `${year}-05-01`, name: 'May Day', type: 'public' },
    { date: `${year}-05-25`, name: 'Africa Day', type: 'public' },
    { date: `${year}-07-01`, name: 'Republic Day', type: 'public' },
    { date: `${year}-08-04`, name: "Founders' Day", type: 'public' },
    { date: `${year}-09-21`, name: 'Kwame Nkrumah Memorial Day', type: 'public' },
    { date: formatDate(farmersDay), name: "Farmer's Day", type: 'public' },
    { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
    { date: `${year}-12-26`, name: 'Boxing Day', type: 'public' },
  ];

  // Add Eid holidays if we have data for this year
  const eids = eidDates[year];
  if (eids) {
    const fitrDay1 = new Date(year, eids.fitr[0] - 1, eids.fitr[1]);
    const fitrDay2 = new Date(fitrDay1);
    fitrDay2.setDate(fitrDay1.getDate() + 1);
    holidays.push(
      { date: formatDate(fitrDay1), name: 'Eid ul-Fitr', type: 'public' },
      { date: formatDate(fitrDay2), name: 'Eid ul-Fitr (Day 2)', type: 'public' },
    );

    const adhaDay1 = new Date(year, eids.adha[0] - 1, eids.adha[1]);
    const adhaDay2 = new Date(adhaDay1);
    adhaDay2.setDate(adhaDay1.getDate() + 1);
    holidays.push(
      { date: formatDate(adhaDay1), name: 'Eid ul-Adha', type: 'public' },
      { date: formatDate(adhaDay2), name: 'Eid ul-Adha (Day 2)', type: 'public' },
    );
  }

  // Sort by date
  holidays.sort((a, b) => a.date.localeCompare(b.date));

  return holidays;
}

/**
 * GET /api/holidays
 * Get Ghana public holidays for a given year
 * Query params:
 *  - year: year to fetch holidays for (defaults to current year)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Check cache first
    const cached = holidayCache.get(year);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      }, { headers: corsHeaders });
    }

    // Get Ghana holidays (includes calculated Easter dates)
    const holidays = getGhanaHolidays(year);

    // Cache the result
    holidayCache.set(year, { data: holidays, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      data: holidays,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holidays' },
      { status: 500, headers: corsHeaders }
    );
  }
}
