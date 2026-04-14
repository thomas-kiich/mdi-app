CREATE TABLE `rechts_aufgaben` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kategorie` enum('datenschutz','impressum','ki_recht','nutzungsbedingungen','sonstiges') NOT NULL,
	`titel` varchar(255) NOT NULL,
	`beschreibung` text NOT NULL,
	`intervallTage` int NOT NULL DEFAULT 30,
	`letztesPruefungMs` bigint,
	`naechsteFaelligMs` bigint NOT NULL,
	`aktiv` boolean NOT NULL DEFAULT true,
	`prioritaet` enum('hoch','mittel','niedrig') NOT NULL DEFAULT 'mittel',
	`quellen` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rechts_aufgaben_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rechts_pruefprotokoll` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aufgabeId` int NOT NULL,
	`geprueftVon` enum('user','ma_auto') NOT NULL DEFAULT 'user',
	`ergebnis` enum('ok','anpassung_noetig','kritisch') NOT NULL,
	`notizen` text,
	`maAnalyse` text,
	`handlungsempfehlungen` text,
	`geprueftAmMs` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rechts_pruefprotokoll_id` PRIMARY KEY(`id`)
);
