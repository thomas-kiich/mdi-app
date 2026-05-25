CREATE TABLE `stimmklang_beratungsanfragen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`nachricht` text,
	`dominanteMdiId` int,
	`metapher` varchar(128),
	`emailVersendet` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stimmklang_beratungsanfragen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stimmklang_messungen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`datumISO` varchar(10) NOT NULL,
	`dominanteMdiId` int NOT NULL,
	`dominanteFrequenz` float NOT NULL,
	`metapher` varchar(128),
	`farbHex` varchar(7),
	`wurzelklangMdiId` int,
	`mdiVerteilung` text,
	`tagNummer` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stimmklang_messungen_id` PRIMARY KEY(`id`)
);
