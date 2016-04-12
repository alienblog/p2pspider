SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `torrent` (
  `id` char(40) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `length` bigint(20) NOT NULL,
  `files` varchar(5000) NOT NULL,
  `lastupdated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `torrent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_index` (`created`);