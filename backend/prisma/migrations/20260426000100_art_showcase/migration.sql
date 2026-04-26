CREATE TABLE IF NOT EXISTS `ArtPortfolio` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `caption` text NOT NULL,
  `imageUrl` varchar(191) NOT NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ArtPortfolio_sortOrder_createdAt_idx` (`sortOrder`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PracticalKhata` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `caption` text NOT NULL,
  `imageUrl` varchar(191) NOT NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PracticalKhata_sortOrder_createdAt_idx` (`sortOrder`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
