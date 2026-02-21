export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { toRelativePath } from '@/lib/url-utils';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  try {
    // First, try to get hero slides from the home page's page_content section
    // This is where HomePageEditor saves them
    const pageContentResult = await query(
      `SELECT ps.content
       FROM page_sections ps
       JOIN pages p ON ps.page_id = p.id
       WHERE p.slug = 'home'
         AND ps.section_key = 'page_content'
         AND ps.is_active = true
       LIMIT 1`,
      []
    );

    if (pageContentResult.rows.length > 0) {
      const sectionContent = pageContentResult.rows[0].content;
      let parsedContent: any = {};

      // Parse the content if it's a string
      if (typeof sectionContent === 'string') {
        try {
          parsedContent = JSON.parse(sectionContent);
        } catch {
          parsedContent = {};
        }
      } else {
        parsedContent = sectionContent || {};
      }

      const heroSlides = parsedContent.heroSlides || [];

      const slides = heroSlides.map((slide: any, index: number) => ({
        id: index + 1,
        title: slide.headline || slide.title || '',
        subtitle: slide.description || slide.subtitle || '',
        image_url: toRelativePath(slide.image) || '',
        link_text: slide.ctaText || '',
        link_url: slide.ctaLink || '',
        title_font_size: slide.titleFontSize || 'medium',
        subtitle_font_size: slide.subtitleFontSize || 'medium',
        blue_box_text: slide.blueBox?.text || slide.blueBoxText || '',
        blue_box_color: slide.blueBox?.color || slide.blueBoxColor || '#2a3f75',
        blue_box_opacity: slide.blueBox?.opacity ?? slide.blueBoxOpacity ?? 100,
      }));

      // Return slides (even if empty array - no fallback)
      const response = NextResponse.json(slides);
      corsResponse(response, request.headers.get('origin'));
      return response;
    }

    const result = await query(
      `SELECT
        id,
        title,
        excerpt,
        body,
        featured_image_url,
        meta_data,
        published_at,
        created_at
      FROM content
      WHERE type = 'hero_slide'
        AND status = 'published'
        AND deleted_at IS NULL
      ORDER BY published_at DESC, created_at DESC`,
      []
    );

    const slides = result.rows.map((row: any) => {
      const metaData = row.meta_data || {};

      // Parse body content for button and font size data
      let bodyData: any = {};
      try {
        if (row.body) {
          bodyData = JSON.parse(row.body);
        }
      } catch {
        bodyData = {};
      }

      return {
        id: row.id,
        title: row.title,
        subtitle: row.excerpt || metaData.subtitle || '',
        image_url: toRelativePath(row.featured_image_url || metaData.image_url) || '',
        link_text: bodyData.buttonText || metaData.link_text || metaData.buttonText || '',
        link_url: bodyData.buttonLink || metaData.link_url || metaData.buttonLink || '',
        title_font_size: bodyData.titleFontSize || 'medium',
        subtitle_font_size: bodyData.subtitleFontSize || 'medium',
        blue_box_text: bodyData.blueBoxText || metaData.blueBoxText || '',
        blue_box_color: bodyData.blueBoxColor || metaData.blueBoxColor || '#2a3f75',
        blue_box_opacity: bodyData.blueBoxOpacity ?? metaData.blueBoxOpacity ?? 100,
      };
    });

    const response = NextResponse.json(slides);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch {
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
