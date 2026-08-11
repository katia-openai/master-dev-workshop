CREATE TABLE `mission_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`person` text DEFAULT '' NOT NULL,
	`due_at` text,
	`source_id` text,
	`waiting_on` text,
	`url` text,
	`is_manual` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_mission_tasks_owner_status` ON `mission_tasks` (`owner_id`,`status`);