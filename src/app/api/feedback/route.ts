import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');

    if (!bookingId || isNaN(parseInt(bookingId))) {
      return NextResponse.json({ 
        error: 'Valid bookingId is required',
        code: 'INVALID_BOOKING_ID' 
      }, { status: 400 });
    }

    const result = await db.select()
      .from(feedback)
      .where(eq(feedback.bookingId, parseInt(bookingId)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'Feedback not found for this booking',
        code: 'FEEDBACK_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, userId, rating, comments } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json({ 
        error: 'bookingId is required',
        code: 'MISSING_BOOKING_ID' 
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!rating) {
      return NextResponse.json({ 
        error: 'rating is required',
        code: 'MISSING_RATING' 
      }, { status: 400 });
    }

    // Validate bookingId is valid integer
    if (isNaN(parseInt(bookingId))) {
      return NextResponse.json({ 
        error: 'bookingId must be a valid integer',
        code: 'INVALID_BOOKING_ID' 
      }, { status: 400 });
    }

    // Validate userId is valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: 'userId must be a valid integer',
        code: 'INVALID_USER_ID' 
      }, { status: 400 });
    }

    // Validate rating is valid integer
    if (isNaN(parseInt(rating))) {
      return NextResponse.json({ 
        error: 'rating must be a valid integer',
        code: 'INVALID_RATING' 
      }, { status: 400 });
    }

    // Validate rating is between 1 and 5
    const ratingValue = parseInt(rating);
    if (ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json({ 
        error: 'rating must be between 1 and 5',
        code: 'INVALID_RATING_RANGE' 
      }, { status: 400 });
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.bookingId, parseInt(bookingId)))
      .limit(1);

    if (existingFeedback.length > 0) {
      return NextResponse.json({ 
        error: 'Feedback already submitted for this booking',
        code: 'DUPLICATE_FEEDBACK' 
      }, { status: 400 });
    }

    // Create new feedback
    const newFeedback = await db.insert(feedback)
      .values({
        bookingId: parseInt(bookingId),
        userId: parseInt(userId),
        rating: ratingValue,
        comments: comments ? comments.trim() : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFeedback[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}