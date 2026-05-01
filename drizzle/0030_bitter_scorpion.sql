CREATE TABLE `backlog_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titel` varchar(255) NOT NULL,
	`beschreibung` text,
	`kategorie` enum('feature','content','marketing','technik','strategie','sonstiges') NOT NULL DEFAULT 'sonstiges',
	`prioritaet` enum('hoch','mittel','niedrig') NOT NULL DEFAULT 'mittel',
	`status` enum('offen','in_arbeit','erledigt','verworfen') NOT NULL DEFAULT 'offen',
	`zieldatum` varchar(64),
	`erstelltVon` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backlog_items_id` PRIMARY KEY(`id`)
);
