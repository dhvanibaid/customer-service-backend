CREATE TABLE `booking_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`assigned_at` text NOT NULL,
	`accepted_at` text,
	`started_at` text,
	`completed_at` text,
	`status` text DEFAULT 'assigned' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employee_otp_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`otp_code` text NOT NULL,
	`expires_at` text NOT NULL,
	`is_verified` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`specialization` text,
	`status` text DEFAULT 'active' NOT NULL,
	`rating` real DEFAULT 0,
	`completed_jobs` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_phone_number_unique` ON `employees` (`phone_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `employees_email_unique` ON `employees` (`email`);