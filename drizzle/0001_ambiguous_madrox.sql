CREATE TABLE `trades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`entryDate` timestamp NOT NULL,
	`entryPrice` decimal(10,4) NOT NULL,
	`exitDate` timestamp NOT NULL,
	`exitPrice` decimal(10,4) NOT NULL,
	`quantity` decimal(12,4) NOT NULL,
	`tradeType` enum('long','short') NOT NULL,
	`notes` text,
	`tags` varchar(255),
	`pnl` decimal(12,2),
	`pnlPercent` decimal(8,4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trades_id` PRIMARY KEY(`id`)
);
