CREATE TABLE `einkaufsliste` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`artikel` text NOT NULL,
	`menge` varchar(64),
	`gekauft` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `einkaufsliste_id` PRIMARY KEY(`id`)
);
