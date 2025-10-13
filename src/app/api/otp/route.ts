import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { otpVerifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, action = 'generate', otpCode } = body;

    // Validate phoneNumber is provided
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Phone number is required',
          code: 'MISSING_PHONE_NUMBER' 
        },
        { status: 400 }
      );
    }

    const trimmedPhoneNumber = phoneNumber.trim();

    // Handle OTP generation
    if (action === 'generate') {
      // Generate random 6-digit OTP code
      const generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Calculate expiry time (5 minutes from now)
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 5);
      const expiresAt = expiryTime.toISOString();

      // Create new OTP verification record
      const newOtpRecord = await db.insert(otpVerifications)
        .values({
          phoneNumber: trimmedPhoneNumber,
          otpCode: generatedOtpCode,
          expiresAt: expiresAt,
          isVerified: false,
          createdAt: new Date().toISOString()
        })
        .returning();

      return NextResponse.json(
        {
          message: 'OTP sent successfully',
          otpCode: generatedOtpCode // For testing purposes
        },
        { status: 201 }
      );
    }

    // Handle OTP verification
    if (action === 'verify') {
      // Validate otpCode is provided
      if (!otpCode || typeof otpCode !== 'string' || otpCode.trim() === '') {
        return NextResponse.json(
          { 
            error: 'OTP code is required for verification',
            code: 'MISSING_OTP_CODE' 
          },
          { status: 400 }
        );
      }

      const trimmedOtpCode = otpCode.trim();

      // Find the most recent non-verified OTP for this phone number
      const otpRecords = await db.select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.phoneNumber, trimmedPhoneNumber),
            eq(otpVerifications.isVerified, false)
          )
        )
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);

      // Check if OTP record exists
      if (otpRecords.length === 0) {
        return NextResponse.json(
          { 
            error: 'No valid OTP found for this phone number',
            code: 'OTP_NOT_FOUND' 
          },
          { status: 400 }
        );
      }

      const otpRecord = otpRecords[0];

      // Check if OTP matches
      if (otpRecord.otpCode !== trimmedOtpCode) {
        return NextResponse.json(
          { 
            error: 'Invalid OTP code',
            code: 'INVALID_OTP' 
          },
          { status: 400 }
        );
      }

      // Check if OTP has expired
      const currentTime = new Date();
      const expiryTime = new Date(otpRecord.expiresAt);

      if (currentTime > expiryTime) {
        return NextResponse.json(
          { 
            error: 'OTP has expired',
            code: 'OTP_EXPIRED' 
          },
          { status: 400 }
        );
      }

      // Update OTP record to mark as verified
      const updatedOtp = await db.update(otpVerifications)
        .set({
          isVerified: true
        })
        .where(eq(otpVerifications.id, otpRecord.id))
        .returning();

      return NextResponse.json(
        {
          message: 'OTP verified successfully'
        },
        { status: 200 }
      );
    }

    // Invalid action
    return NextResponse.json(
      { 
        error: 'Invalid action. Must be "generate" or "verify"',
        code: 'INVALID_ACTION' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}