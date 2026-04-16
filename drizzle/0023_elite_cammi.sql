CREATE TABLE `training_freigaben` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` varchar(50) NOT NULL,
	`itemId` varchar(50),
	`enabled` boolean NOT NULL DEFAULT false,
	`label` varchar(100),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_freigaben_id` PRIMARY KEY(`id`)
);
