CREATE TABLE `dankbarkeit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`datum` varchar(10) NOT NULL,
	`eintrag1` text,
	`eintrag2` text,
	`eintrag3` text,
	`stimmung` int,
	`abendReflexion` text,
	`maAbschluss` text,
	`createdAtMs` bigint NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dankbarkeit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ritual_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`typ` enum('morgen','pause','atem','dankbarkeit','abend') NOT NULL,
	`datum` varchar(10) NOT NULL,
	`notiz` text,
	`createdAtMs` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ritual_logs_id` PRIMARY KEY(`id`)
);
