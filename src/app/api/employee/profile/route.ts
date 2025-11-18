import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employees } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    // Validate that at least one parameter is provided
    if (!phone && !id) {
      return NextResponse.json(
        { 
          error: 'Either phone number or id parameter is required',
          code: 'MISSING_PARAMETER' 
        },
        { status: 400 }
      );
    }

    // Validate id if provided
    if (id && isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Build query condition
    let whereCondition;
    if (id && phone) {
      whereCondition = or(
        eq(employees.id, parseInt(id)),
        eq(employees.phoneNumber, phone)
      );
    } else if (id) {
      whereCondition = eq(employees.id, parseInt(id));
    } else {
      whereCondition = eq(employees.phoneNumber, phone!);
    }

    const employee = await db.select()
      .from(employees)
      .where(whereCondition)
      .limit(1);

    if (employee.length === 0) {
      return NextResponse.json(
        { 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(employee[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, specialization } = body;

    // Validate required fields
    if (!phoneNumber || !name || !specialization) {
      return NextResponse.json(
        { 
          error: 'Phone number, name, and specialization are required',
          code: 'MISSING_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { 
          error: 'Invalid phone number format. Must be 10 digits',
          code: 'INVALID_PHONE' 
        },
        { status: 400 }
      );
    }

    // Check if employee already exists
    const existingEmployee = await db.select()
      .from(employees)
      .where(eq(employees.phoneNumber, phoneNumber))
      .limit(1);

    if (existingEmployee.length > 0) {
      return NextResponse.json(
        { 
          error: 'Employee with this phone number already exists',
          code: 'EMPLOYEE_EXISTS' 
        },
        { status: 409 }
      );
    }

    // Create new employee
    const newEmployee = await db.insert(employees)
      .values({
        phoneNumber: phoneNumber,
        name: name.trim(),
        specialization: specialization.trim(),
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newEmployee[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate id parameter is provided
    if (!id) {
      return NextResponse.json(
        { 
          error: 'ID parameter is required',
          code: 'MISSING_PARAMETER' 
        },
        { status: 400 }
      );
    }

    // Validate id is valid integer
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if employee exists
    const existingEmployee = await db.select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)))
      .limit(1);

    if (existingEmployee.length === 0) {
      return NextResponse.json(
        { 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, specialization, status } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      updates.name = typeof name === 'string' ? name.trim() : name;
    }

    if (email !== undefined) {
      updates.email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    }

    if (specialization !== undefined) {
      updates.specialization = typeof specialization === 'string' ? specialization.trim() : specialization;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    // Update employee
    const updatedEmployee = await db.update(employees)
      .set(updates)
      .where(eq(employees.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedEmployee[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}