CREATE TABLE `beta_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`email` varchar(320),
	`notiz` varchar(256),
	`usedByUserId` int,
	`usedAt` timestamp,
	`betaEndsAt` timestamp,
	`aktiv` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `beta_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `beta_invites_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `abonnements` MODIFY COLUMN `ebene` enum('free','essential','complete','pro','beta') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `abonnements` MODIFY COLUMN `status` enum('trial','active','cancelled','expired','beta') NOT NULL DEFAULT 'trial';