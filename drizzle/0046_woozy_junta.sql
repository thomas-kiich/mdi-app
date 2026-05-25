CREATE TABLE `raum36_sendungen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`typ` varchar(32) NOT NULL,
	`titel` varchar(255) NOT NULL,
	`text` text NOT NULL,
	`empfaenger_anzahl` int NOT NULL DEFAULT 0,
	`gesendet` int NOT NULL DEFAULT 0,
	`fehlgeschlagen` int NOT NULL DEFAULT 0,
	`nur_test` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `raum36_sendungen_id` PRIMARY KEY(`id`)
);
