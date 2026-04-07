CREATE TABLE `momentaufnahmen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`kategorie` enum('ICH','QUELL','KONZEPT','PROJEKT','DIALOG','WELT') NOT NULL DEFAULT 'QUELL',
	`zusammenfassung` text,
	`audioUrl` varchar(512),
	`dauerSekunden` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `momentaufnahmen_id` PRIMARY KEY(`id`)
);
