CREATE TABLE `tts_nutzungslog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`zeichen` int NOT NULL,
	`kontext` varchar(64) NOT NULL DEFAULT 'sonstige',
	`stimme` varchar(64) DEFAULT 'de-DE-Chirp3-HD-Zephyr',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tts_nutzungslog_id` PRIMARY KEY(`id`)
);
