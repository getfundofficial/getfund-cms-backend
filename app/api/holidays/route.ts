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
 * Ghana Public Holidays
 * Includes fixed holidays and calculated dates for Easter
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

  return [
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
    { date: `${year}-12-01`, name: "Farmer's Day", type: 'public' },
    { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
    { date: `${year}-12-26`, name: 'Boxing Day', type: 'public' },
  ];
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
