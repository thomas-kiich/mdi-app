CREATE TABLE `faq_fragen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128),
	`email` varchar(320),
	`frage` text NOT NULL,
	`antwort` text,
	`status` enum('offen','beantwortet','archiviert') NOT NULL DEFAULT 'offen',
	`oeffentlich` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faq_fragen_id` PRIMARY KEY(`id`)
);
