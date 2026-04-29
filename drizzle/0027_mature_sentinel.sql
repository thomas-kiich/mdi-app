CREATE INDEX `idx_coaching_einwilligungen_coachId_widerrufenAtMs` ON `coaching_einwilligungen` (`coachId`,`widerrufenAtMs`);--> statement-breakpoint
CREATE INDEX `idx_coaching_einwilligungen_coachId` ON `coaching_einwilligungen` (`coachId`);--> statement-breakpoint
CREATE INDEX `idx_coaching_einwilligungen_userId` ON `coaching_einwilligungen` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_vital_eintraege_userId_datum` ON `vital_eintraege` (`userId`,`datum`);--> statement-breakpoint
CREATE INDEX `idx_vital_eintraege_userId` ON `vital_eintraege` (`userId`);