CREATE TABLE `premium_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feature` varchar(64) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`note` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premium_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `premium_settings_feature_unique` UNIQUE(`feature`)
);
