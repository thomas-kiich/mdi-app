CREATE TABLE `coach_notizen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notiz` text NOT NULL DEFAULT (''),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_notizen_id` PRIMARY KEY(`id`),
	CONSTRAINT `coach_notizen_userId_unique` UNIQUE(`userId`)
);
