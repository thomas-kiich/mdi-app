CREATE TABLE `training_einheiten` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kategorie` enum('befindlichkeit','atemtraining','stimmklangtraining','bewegungstraining','umfeldaktivierung') NOT NULL,
	`titel` varchar(200) NOT NULL,
	`kurzbeschreibung` text NOT NULL,
	`beschreibung` text,
	`dauern` varchar(50) NOT NULL DEFAULT '7,12,21',
	`audioUrl` text,
	`videoUrl` text,
	`infografikUrl` text,
	`audioBeschreibungUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`aktiv` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_einheiten_id` PRIMARY KEY(`id`)
);
