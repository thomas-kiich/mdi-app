CREATE TABLE `podcast_episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeNumber` varchar(10) NOT NULL,
	`catchphrase` varchar(100) NOT NULL,
	`subtitle` text NOT NULL,
	`audioUrl` text NOT NULL,
	`coverImageUrl` text NOT NULL,
	`description` text,
	`isLatest` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`youtubeUrl` text,
	`spotifyUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_episodes_id` PRIMARY KEY(`id`)
);
