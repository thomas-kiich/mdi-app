CREATE TABLE `coaching_einwilligungen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`coachId` int NOT NULL,
	`eingewilligtAtMs` bigint NOT NULL,
	`widerrufenAtMs` bigint,
	`einwilligungsText` text NOT NULL,
	`ipAdresse` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_einwilligungen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vital_eintraege` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`datum` varchar(10) NOT NULL,
	`ruhepuls` int,
	`hrv` int,
	`apnoeAus` varchar(10),
	`apnoeEin` varchar(10),
	`bolt` int,
	`temperatur` varchar(10),
	`gewicht` varchar(10),
	`anmerkungen` text,
	`tagesplan` text,
	`createdAtMs` bigint NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vital_eintraege_id` PRIMARY KEY(`id`)
);
