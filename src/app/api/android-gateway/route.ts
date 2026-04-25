import { NextResponse } from 'next/server';
import { generateQuotes } from '@/app/quotes/actions';
import { getRecommendedVideos } from '@/app/recreation/actions';
import { generateCrossword } from '@/app/games/crosswords/actions';
import { generateConcepts, getPhilosophyFeedback } from '@/app/learn/philosophy/actions';
import { generateScienceConcepts, getScienceFeedback } from '@/app/learn/science/actions';
import { generateChallenge } from '@/app/activities/challenges/actions';

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    console.log(`[Android Gateway] Executing action: ${action}`);

    switch (action) {
      case 'generateQuotes':
        return NextResponse.json(await generateQuotes());

      case 'getRecommendedVideos':
        return NextResponse.json(await getRecommendedVideos(
          payload.interests, 
          payload.videoGenres, 
          payload.context, 
          payload.history, 
          payload.preferredLanguages
        ));

      case 'generateCrossword':
        return NextResponse.json(await generateCrossword());

      case 'generateConcepts':
        return NextResponse.json(await generateConcepts(payload.interests, payload.exclude));

      case 'getPhilosophyFeedback':
        return NextResponse.json(await getPhilosophyFeedback(
          payload.conceptName, 
          payload.conceptText, 
          payload.question, 
          payload.userAnswer
        ));

      case 'generateScienceConcepts':
        return NextResponse.json(await generateScienceConcepts(payload.interests, payload.exclude));

      case 'getScienceFeedback':
        return NextResponse.json(await getScienceFeedback(
          payload.conceptName, 
          payload.conceptText, 
          payload.question, 
          payload.userAnswer
        ));

      case 'generateChallenge':
        return NextResponse.json(await generateChallenge(payload.context, payload.previousChallenges));

      // Placeholder handlers for non-existent actions to keep the gateway "ready"
      case 'getChallengeFeedback':
        return NextResponse.json({ success: false, feedback: "Feedback system coming soon." });
      
      case 'generatePhilosophyLesson':
        return NextResponse.json({ success: false, error: "Lesson generation coming soon." });
      
      case 'generateScienceLesson':
        return NextResponse.json({ success: false, error: "Lesson generation coming soon." });

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Android Gateway] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
