ALTER TABLE `vital_eintraege` MODIFY COLUMN `ruhepuls` float;--> statement-breakpoint
ALTER TABLE `vital_eintraege` MODIFY COLUMN `hrv` float;--> statement-breakpoint
ALTER TABLE `vital_eintraege` MODIFY COLUMN `bolt` float;--> statement-breakpoint
ALTER TABLE `vital_eintraege` ADD `boltMcp` float;--> statement-breakpoint
ALTER TABLE `vital_eintraege` ADD `boltCp` float;