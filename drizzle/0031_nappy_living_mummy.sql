CREATE TABLE `raum36_fragen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pseudonym` varchar(64) NOT NULL,
	`frage` text NOT NULL,
	`antwort` text,
	`beantwortetAt` timestamp,
	`sichtbar` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `raum36_fragen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `raum36_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titel` varchar(255) NOT NULL,
	`beschreibung` text,
	`videoUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `raum36_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `raum36_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`status` enum('active','inactive','cancelled','past_due') NOT NULL DEFAULT 'inactive',
	`pseudonym` varchar(64),
	`activatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `raum36_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `raum36_wissenspool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titel` varchar(255) NOT NULL,
	`beschreibung` text,
	`typ` enum('podcast','artikel','fakt','video','tool','sonstiges') NOT NULL DEFAULT 'sonstiges',
	`url` varchar(512),
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `raum36_wissenspool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stimmklanganalyse_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(128),
	`stripeCustomerId` varchar(128),
	`status` enum('pending','paid','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stimmklanganalyse_orders_id` PRIMARY KEY(`id`)
);
