CREATE TABLE `erinnerungen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`originalText` text,
	`faelligkeitMs` int NOT NULL,
	`ausgeloest` boolean NOT NULL DEFAULT false,
	`bestaetigt` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erinnerungen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `erledigungen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`kategorie` enum('ICH','QUELL','KONZEPT','PROJEKT','DIALOG','WELT') DEFAULT 'PROJEKT',
	`erledigt` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `erledigungen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visionen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`kategorie` enum('ICH','QUELL','KONZEPT','PROJEKT','DIALOG','WELT') DEFAULT 'QUELL',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visionen_id` PRIMARY KEY(`id`)
);
