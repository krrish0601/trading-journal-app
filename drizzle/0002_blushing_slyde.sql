CREATE TABLE `tradeTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`tradeType` enum('long','short') NOT NULL,
	`riskPercent` decimal(5,2),
	`rewardPercent` decimal(5,2),
	`notes` text,
	`tags` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradeTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trades` ADD `imageUrls` text;