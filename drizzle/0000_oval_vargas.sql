CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`user` text NOT NULL,
	`status` text NOT NULL,
	`name` text NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event` text NOT NULL,
	`user` text NOT NULL,
	`data` text NOT NULL
);
