CREATE TABLE `kiich_praxis_projekte` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titel` varchar(200) NOT NULL,
	`beschreibung` text NOT NULL,
	`detailbeschreibung` text,
	`link` varchar(512) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`aktiv` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kiich_praxis_projekte_id` PRIMARY KEY(`id`)
);
