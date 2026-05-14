CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` enum('read','update','delete','export','access') NOT NULL,
	`dataType` varchar(64) NOT NULL,
	`reason` enum('user_self_access','coaching_access','admin_access','data_export','account_deletion','compliance_check') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_userId_createdAt` ON `audit_logs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_userId` ON `audit_logs` (`userId`);