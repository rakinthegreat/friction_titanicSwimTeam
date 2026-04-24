import { NextResponse } from 'next/server';
import { generateQuotes } from '@/app/quotes/actions';
import { getRecommendedVideos } from '@/app/recreation/actions';
import { generateCrossword } from '@/app/games/crosswords/actions';

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    console.log(`[Android Gateway] Executing action: ${action}`);

    switch (action) {
      case 'generateQuotes':
        const quotesResult = await generateQuotes();
        return NextResponse.json(quotesResult);

      case 'getRecommendedVideos':
        const { interests, videoGenres, context, history, preferredLanguages } = payload;
        const videosResult = await getRecommendedVideos(interests, videoGenres, context, history, preferredLanguages);
        return NextResponse.json(videosResult);

      case 'generateCrossword':
        const crosswordResult = await generateCrossword();
        return NextResponse.json(crosswordResult);

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Android Gateway] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Ensure this route is not cached
export const dynamic = 'force-dynamic';
