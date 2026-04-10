CREATE TABLE `einschlaf_bibliothek` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kategorie` enum('MAERCHEN','ABENTEUER','BEFINDLICHKEIT') NOT NULL,
	`zielgruppe` enum('KIND','JUGENDLICHER','ERWACHSENER') NOT NULL DEFAULT 'ERWACHSENER',
	`thema` varchar(128) NOT NULL,
	`personalisierung` text,
	`titel` varchar(256) NOT NULL,
	`text` text NOT NULL,
	`audioUrl` varchar(512),
	`dauerSekunden` int,
	`favorit` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `einschlaf_bibliothek_id` PRIMARY KEY(`id`)
);
