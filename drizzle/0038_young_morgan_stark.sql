CREATE TABLE `health_screenings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`hasHighBloodPressure` boolean NOT NULL DEFAULT false,
	`hasAsthma` boolean NOT NULL DEFAULT false,
	`hasHeartArrhythmia` boolean NOT NULL DEFAULT false,
	`hasEpilepsy` boolean NOT NULL DEFAULT false,
	`isPregnant` boolean NOT NULL DEFAULT false,
	`hasRecentSurgery` boolean NOT NULL DEFAULT false,
	`hasAnxietyDisorder` boolean NOT NULL DEFAULT false,
	`hasDepression` boolean NOT NULL DEFAULT false,
	`hasSleepDisorder` boolean NOT NULL DEFAULT false,
	`hasMentalIllness` boolean NOT NULL DEFAULT false,
	`hasSubstanceAbuse` boolean NOT NULL DEFAULT false,
	`status` enum('pending','excluded_physical','approved','pending_attestation','approved_with_attestation','rejected') NOT NULL DEFAULT 'pending',
	`attestationUrl` varchar(512),
	`physicianName` varchar(255),
	`attestationDate` varchar(10),
	`approvedAt` timestamp,
	`expiresAt` timestamp,
	`notes` text,
	`ipAddress` varchar(45),
	`disclaimerAccepted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_screenings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_health_screenings_userId` ON `health_screenings` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_health_screenings_status` ON `health_screenings` (`status`);--> statement-breakpoint
CREATE INDEX `idx_health_screenings_expiresAt` ON `health_screenings` (`expiresAt`);