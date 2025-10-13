import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, parseInt(userId)))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

    return NextResponse.json(userAddresses, { status: 200 });
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
    const {
      userId,
      apartmentBuilding,
      streetArea,
      city,
      state,
      pincode,
      isDefault = false,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'userId must be a valid number', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (isDefault === true) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, parseInt(userId)));
    }

    const newAddress = await db
      .insert(addresses)
      .values({
        userId: parseInt(userId),
        apartmentBuilding: apartmentBuilding?.trim() || null,
        streetArea: streetArea?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        pincode: pincode?.trim() || null,
        isDefault: isDefault,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAddress[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingAddress = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, parseInt(id)))
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { error: 'Address not found', code: 'ADDRESS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      apartmentBuilding,
      streetArea,
      city,
      state,
      pincode,
      isDefault,
    } = body;

    if (isDefault === true) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, existingAddress[0].userId),
            eq(addresses.id, parseInt(id))
          )
        );

      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, existingAddress[0].userId));
    }

    const updateData: any = {};
    if (apartmentBuilding !== undefined) updateData.apartmentBuilding = apartmentBuilding?.trim() || null;
    if (streetArea !== undefined) updateData.streetArea = streetArea?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (state !== undefined) updateData.state = state?.trim() || null;
    if (pincode !== undefined) updateData.pincode = pincode?.trim() || null;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedAddress = await db
      .update(addresses)
      .set(updateData)
      .where(eq(addresses.id, parseInt(id)))
      .returning();

    if (updatedAddress.length === 0) {
      return NextResponse.json(
        { error: 'Address not found', code: 'ADDRESS_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAddress[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}