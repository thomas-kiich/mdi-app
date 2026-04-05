ALTER TABLE `newsletter_subscribers` MODIFY COLUMN `active` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `confirmToken` varchar(128);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `confirmedAt` timestamp;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `deleteToken` varchar(128);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `signupIp` varchar(45);