import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');

    if (!id && !phone) {
      return NextResponse.json(
        { 
          error: 'Either ID or phone number parameter is required',
          code: 'MISSING_PARAMETER'
        },
        { status: 400 }
      );
    }

    let user;

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID'
          },
          { status: 400 }
        );
      }

      const result = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      user = result[0];
    } else if (phone) {
      const result = await db.select()
        .from(users)
        .where(eq(users.phoneNumber, phone))
        .limit(1);

      user = result[0];
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone_number, name } = body;

    // Validate phone_number is provided and not empty
    if (!phone_number || phone_number.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Phone number is required',
          code: 'PHONE_NUMBER_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedPhoneNumber = phone_number.trim();
    const sanitizedName = name ? name.trim() : null;

    // Check if user already exists with this phone number
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.phoneNumber, sanitizedPhoneNumber))
      .limit(1);

    if (existingUser.length > 0) {
      // Return existing user for login/registration flow
      return NextResponse.json(existingUser[0], { status: 200 });
    }

    // Create new user
    const timestamp = new Date().toISOString();
    const newUser = await db.insert(users)
      .values({
        phoneNumber: sanitizedPhoneNumber,
        name: sanitizedName,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}