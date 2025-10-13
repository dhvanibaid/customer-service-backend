import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

const ALLOWED_SERVICE_TYPES = ['plumber', 'electrician', 'carpenter', 'painter', 'househelp'];
const ALLOWED_STATUS_VALUES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // Get single booking by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    // Get bookings by userId
    if (userId) {
      if (!userId || isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, parseInt(userId)))
        .orderBy(desc(bookings.createdAt));

      return NextResponse.json(userBookings, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Either id or userId parameter is required', code: 'MISSING_PARAMETER' },
      { status: 400 }
    );
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
      addressId,
      serviceType,
      subService,
      workDescription,
      photoUrl,
      bookingDate,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { error: 'addressId is required', code: 'MISSING_ADDRESS_ID' },
        { status: 400 }
      );
    }

    if (!serviceType) {
      return NextResponse.json(
        { error: 'serviceType is required', code: 'MISSING_SERVICE_TYPE' },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'userId must be a valid integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Validate addressId is a valid integer
    if (isNaN(parseInt(addressId))) {
      return NextResponse.json(
        { error: 'addressId must be a valid integer', code: 'INVALID_ADDRESS_ID' },
        { status: 400 }
      );
    }

    // Validate serviceType
    if (!ALLOWED_SERVICE_TYPES.includes(serviceType.toLowerCase())) {
      return NextResponse.json(
        {
          error: `serviceType must be one of: ${ALLOWED_SERVICE_TYPES.join(', ')}`,
          code: 'INVALID_SERVICE_TYPE',
        },
        { status: 400 }
      );
    }

    // Prepare booking data
    const currentTimestamp = new Date().toISOString();
    const bookingData = {
      userId: parseInt(userId),
      addressId: parseInt(addressId),
      serviceType: serviceType.toLowerCase(),
      subService: subService || null,
      workDescription: workDescription || null,
      photoUrl: photoUrl || null,
      status: 'pending',
      professionalName: null,
      professionalContact: null,
      bookingDate: bookingDate || currentTimestamp,
      completionDate: null,
      createdAt: currentTimestamp,
    };

    const newBooking = await db.insert(bookings).values(bookingData).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      professionalName,
      professionalContact,
      completionDate,
      serviceType,
      subService,
      workDescription,
      photoUrl,
      bookingDate,
    } = body;

    // Validate status if provided
    if (status && !ALLOWED_STATUS_VALUES.includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          error: `status must be one of: ${ALLOWED_STATUS_VALUES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate serviceType if provided
    if (serviceType && !ALLOWED_SERVICE_TYPES.includes(serviceType.toLowerCase())) {
      return NextResponse.json(
        {
          error: `serviceType must be one of: ${ALLOWED_SERVICE_TYPES.join(', ')}`,
          code: 'INVALID_SERVICE_TYPE',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (status !== undefined) updates.status = status.toLowerCase();
    if (professionalName !== undefined) updates.professionalName = professionalName;
    if (professionalContact !== undefined) updates.professionalContact = professionalContact;
    if (completionDate !== undefined) updates.completionDate = completionDate;
    if (serviceType !== undefined) updates.serviceType = serviceType.toLowerCase();
    if (subService !== undefined) updates.subService = subService;
    if (workDescription !== undefined) updates.workDescription = workDescription;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (bookingDate !== undefined) updates.bookingDate = bookingDate;

    const updatedBooking = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedBooking[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}