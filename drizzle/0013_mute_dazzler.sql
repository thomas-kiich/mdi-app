CREATE TABLE `abonnements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ebene` enum('I','II','III') NOT NULL DEFAULT 'I',
	`status` enum('trial','active','cancelled','expired') NOT NULL DEFAULT 'trial',
	`trialStartedAt` timestamp NOT NULL DEFAULT (now()),
	`trialEndsAt` timestamp NOT NULL,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abonnements_id` PRIMARY KEY(`id`),
	CONSTRAINT `abonnements_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `nutzungs_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monat` varchar(7) NOT NULL,
	`aufnahmenCount` int NOT NULL DEFAULT 0,
	`ttsCount` int NOT NULL DEFAULT 0,
	`geschichtenCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutzungs_limits_id` PRIMARY KEY(`id`)
);
