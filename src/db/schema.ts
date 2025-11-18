import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

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

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  discountPercentage: integer('discount_percentage'),
  categoryId: integer('category_id').references(() => categories.id),
  brand: text('brand'),
  imageUrl: text('image_url'),
  images: text('images', { mode: 'json' }),
  specifications: text('specifications', { mode: 'json' }),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  addressId: integer('address_id').notNull().references(() => addresses.id),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull().default('pending'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  orderDate: text('order_date').notNull(),
  deliveryDate: text('delivery_date'),
  trackingNumber: text('tracking_number'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: real('price_at_purchase').notNull(),
  createdAt: text('created_at').notNull(),
});

export const productReviews = sqliteTable('product_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  userId: integer('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  reviewText: text('review_text'),
  createdAt: text('created_at').notNull(),
});

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').unique(),
  specialization: text('specialization'),
  status: text('status').notNull().default('active'),
  rating: real('rating').default(0),
  completedJobs: integer('completed_jobs').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const employeeOtpVerifications = sqliteTable('employee_otp_verifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').notNull(),
  otpCode: text('otp_code').notNull(),
  expiresAt: text('expires_at').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const bookingAssignments = sqliteTable('booking_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  employeeId: integer('employee_id').notNull().references(() => employees.id),
  assignedAt: text('assigned_at').notNull(),
  acceptedAt: text('accepted_at'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  status: text('status').notNull().default('assigned'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});