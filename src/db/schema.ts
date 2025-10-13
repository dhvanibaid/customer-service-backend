import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').notNull().unique(),
  name: text('name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  apartmentBuilding: text('apartment_building'),
  streetArea: text('street_area'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  addressId: integer('address_id').notNull().references(() => addresses.id),
  serviceType: text('service_type').notNull(),
  subService: text('sub_service'),
  workDescription: text('work_description'),
  photoUrl: text('photo_url'),
  status: text('status').notNull().default('pending'),
  professionalName: text('professional_name'),
  professionalContact: text('professional_contact'),
  bookingDate: text('booking_date').notNull(),
  completionDate: text('completion_date'),
  createdAt: text('created_at').notNull(),
});

export const feedback = sqliteTable('feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').notNull().unique().references(() => bookings.id),
  userId: integer('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comments: text('comments'),
  createdAt: text('created_at').notNull(),
});

export const otpVerifications = sqliteTable('otp_verifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').notNull(),
  otpCode: text('otp_code').notNull(),
  expiresAt: text('expires_at').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});