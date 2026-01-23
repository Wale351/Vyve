-- First, update existing games with proper thumbnails
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/743_Axie%20Infinity-285x380.jpg' WHERE slug = 'axie-infinity';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/518198_Big%20Time-285x380.jpg' WHERE slug = 'big-time';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/512824_Gods%20Unchained-285x380.jpg' WHERE slug = 'gods-unchained';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/1844481619_Guild%20of%20Guardians-285x380.jpg' WHERE slug = 'guild-of-guardians';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/499979042_Illuvium-285x380.jpg' WHERE slug = 'illuvium';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg' WHERE slug = 'just-chatting';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/518024_Parallel-285x380.jpg' WHERE slug = 'parallel';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/2034399728_Pixels-285x380.jpg' WHERE slug = 'pixels';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/504461_Splinterlands-285x380.jpg' WHERE slug = 'splinterlands';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/498310_Star%20Atlas-285x380.jpg' WHERE slug = 'star-atlas';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/510607_The%20Sandbox-285x380.jpg' WHERE slug = 'the-sandbox';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/509660-285x380.jpg' WHERE slug = 'art-creative';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/417752-285x380.jpg' WHERE slug = 'crypto-talk';
UPDATE games SET thumbnail_url = 'https://static-cdn.jtvnw.net/ttv-boxart/1748651201_Medieval%20Empires-285x380.jpg' WHERE slug = 'medieval empire';

-- Insert mainstream streaming games
INSERT INTO games (name, slug, category, description, thumbnail_url) VALUES
-- Battle Royale / Shooters
('Fortnite', 'fortnite', 'Battle Royale', 'Build, battle, and be the last one standing in this free-to-play battle royale', 'https://static-cdn.jtvnw.net/ttv-boxart/33214-285x380.jpg'),
('Apex Legends', 'apex-legends', 'Battle Royale', 'Squad-based battle royale with unique legend abilities', 'https://static-cdn.jtvnw.net/ttv-boxart/511224-285x380.jpg'),
('PUBG: Battlegrounds', 'pubg', 'Battle Royale', 'The original battle royale experience', 'https://static-cdn.jtvnw.net/ttv-boxart/493057-285x380.jpg'),
('Call of Duty: Warzone', 'warzone', 'Battle Royale', 'Free-to-play battle royale from the Call of Duty franchise', 'https://static-cdn.jtvnw.net/ttv-boxart/512710-285x380.jpg'),

-- Tactical FPS
('VALORANT', 'valorant', 'Tactical FPS', 'Character-based tactical shooter with precise gunplay', 'https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg'),
('Counter-Strike 2', 'cs2', 'Tactical FPS', 'The next generation of competitive Counter-Strike', 'https://static-cdn.jtvnw.net/ttv-boxart/32399-285x380.jpg'),
('Rainbow Six Siege', 'rainbow-six-siege', 'Tactical FPS', 'Tactical team-based shooter with destructible environments', 'https://static-cdn.jtvnw.net/ttv-boxart/460630-285x380.jpg'),
('Escape from Tarkov', 'escape-from-tarkov', 'Tactical FPS', 'Hardcore realistic online shooter with RPG elements', 'https://static-cdn.jtvnw.net/ttv-boxart/491931-285x380.jpg'),

-- MOBA
('League of Legends', 'league-of-legends', 'MOBA', 'The most-watched competitive MOBA with 160+ champions', 'https://static-cdn.jtvnw.net/ttv-boxart/21779-285x380.jpg'),
('Dota 2', 'dota-2', 'MOBA', 'Valve''s deep strategic MOBA with complex mechanics', 'https://static-cdn.jtvnw.net/ttv-boxart/29595-285x380.jpg'),
('Teamfight Tactics', 'teamfight-tactics', 'Auto Battler', 'Strategic auto-battler set in the League of Legends universe', 'https://static-cdn.jtvnw.net/ttv-boxart/513143-285x380.jpg'),

-- Open World / RPG
('Grand Theft Auto V', 'gta-v', 'Open World', 'Iconic open-world crime game with massive RP community', 'https://static-cdn.jtvnw.net/ttv-boxart/32982_Grand%20Theft%20Auto%20V-285x380.jpg'),
('World of Warcraft', 'world-of-warcraft', 'MMORPG', 'The legendary MMORPG with millions of players worldwide', 'https://static-cdn.jtvnw.net/ttv-boxart/18122-285x380.jpg'),
('Elden Ring', 'elden-ring', 'Action RPG', 'FromSoftware''s acclaimed open-world action RPG', 'https://static-cdn.jtvnw.net/ttv-boxart/512953-285x380.jpg'),
('Diablo IV', 'diablo-4', 'Action RPG', 'Dark action RPG with deep loot and build systems', 'https://static-cdn.jtvnw.net/ttv-boxart/515024-285x380.jpg'),
('Path of Exile', 'path-of-exile', 'Action RPG', 'Free-to-play action RPG with incredibly deep character building', 'https://static-cdn.jtvnw.net/ttv-boxart/29307-285x380.jpg'),
('Final Fantasy XIV', 'ffxiv', 'MMORPG', 'Critically acclaimed MMORPG with an extensive free trial', 'https://static-cdn.jtvnw.net/ttv-boxart/24241-285x380.jpg'),

-- Sandbox / Survival
('Minecraft', 'minecraft', 'Sandbox', 'Build, explore, and survive in infinite blocky worlds', 'https://static-cdn.jtvnw.net/ttv-boxart/27471_Minecraft-285x380.jpg'),
('Rust', 'rust', 'Survival', 'Multiplayer survival game with base building and PvP', 'https://static-cdn.jtvnw.net/ttv-boxart/263490-285x380.jpg'),
('ARK: Survival Ascended', 'ark-survival-ascended', 'Survival', 'Survive and tame dinosaurs in this open-world adventure', 'https://static-cdn.jtvnw.net/ttv-boxart/1751642498-285x380.jpg'),
('Palworld', 'palworld', 'Survival', 'Open-world survival crafting with creature collection', 'https://static-cdn.jtvnw.net/ttv-boxart/2031970920-285x380.jpg'),

-- Hero Shooters
('Overwatch 2', 'overwatch-2', 'Hero Shooter', 'Team-based hero shooter with diverse cast of characters', 'https://static-cdn.jtvnw.net/ttv-boxart/515025-285x380.jpg'),
('Marvel Rivals', 'marvel-rivals', 'Hero Shooter', 'Super hero team-based PvP shooter featuring Marvel characters', 'https://static-cdn.jtvnw.net/ttv-boxart/2330621498-285x380.jpg'),

-- Sports / Racing
('EA Sports FC 25', 'ea-fc-25', 'Sports', 'The world''s most popular football/soccer simulation', 'https://static-cdn.jtvnw.net/ttv-boxart/2326721979-285x380.jpg'),
('Rocket League', 'rocket-league', 'Sports', 'High-octane soccer with rocket-powered cars', 'https://static-cdn.jtvnw.net/ttv-boxart/30921-285x380.jpg'),
('NBA 2K25', 'nba-2k25', 'Sports', 'The premier basketball simulation experience', 'https://static-cdn.jtvnw.net/ttv-boxart/2269095358-285x380.jpg'),

-- Horror / Co-op
('Dead by Daylight', 'dead-by-daylight', 'Horror', 'Asymmetric multiplayer horror game', 'https://static-cdn.jtvnw.net/ttv-boxart/491487-285x380.jpg'),
('Phasmophobia', 'phasmophobia', 'Horror', 'Co-op ghost hunting with VR support', 'https://static-cdn.jtvnw.net/ttv-boxart/518184-285x380.jpg'),
('Lethal Company', 'lethal-company', 'Horror', 'Co-op horror about scavenging on abandoned moons', 'https://static-cdn.jtvnw.net/ttv-boxart/2040754985-285x380.jpg'),

-- Strategy
('Civilization VI', 'civilization-6', 'Strategy', 'Build an empire to stand the test of time', 'https://static-cdn.jtvnw.net/ttv-boxart/490379-285x380.jpg'),

-- Card Games
('Hearthstone', 'hearthstone', 'Card Game', 'Blizzard''s fast-paced digital card game', 'https://static-cdn.jtvnw.net/ttv-boxart/138585-285x380.jpg'),

-- Fighting
('Street Fighter 6', 'street-fighter-6', 'Fighting', 'The latest evolution of the iconic fighting game', 'https://static-cdn.jtvnw.net/ttv-boxart/1924350370-285x380.jpg'),
('Tekken 8', 'tekken-8', 'Fighting', 'The next chapter in the legendary fighting game series', 'https://static-cdn.jtvnw.net/ttv-boxart/2044622664-285x380.jpg'),

-- Web3 Games (additional)
('Off The Grid', 'off-the-grid', 'Web3 FPS', 'Cyberpunk battle royale with blockchain integration', 'https://static-cdn.jtvnw.net/ttv-boxart/1966498228-285x380.jpg'),
('Nyan Heroes', 'nyan-heroes', 'Web3 Shooter', 'Team-based hero shooter with cats piloting mechs on Solana', 'https://static-cdn.jtvnw.net/ttv-boxart/1659999498-285x380.jpg'),
('Alien Worlds', 'alien-worlds', 'Web3 Simulation', 'Explore, mine, and earn in this sci-fi blockchain metaverse', 'https://static-cdn.jtvnw.net/ttv-boxart/1988153816_Alien%20Worlds-285x380.jpg'),
('Deadrop', 'deadrop', 'Web3 FPS', 'Vertical extraction shooter from Dr Disrespect''s studio', 'https://static-cdn.jtvnw.net/ttv-boxart/1812049502-285x380.jpg'),
('Super Champs', 'super-champs', 'Web3 Sports', 'Fast-paced mobile sports game with NFT athletes', 'https://static-cdn.jtvnw.net/ttv-boxart/SuperChamps-285x380.jpg'),
('Shrapnel', 'shrapnel', 'Web3 FPS', 'AAA extraction shooter with modding and player ownership', 'https://static-cdn.jtvnw.net/ttv-boxart/1955929959-285x380.jpg'),
('MapleStory Universe', 'maplestory-universe', 'Web3 MMORPG', 'Blockchain-powered MapleStory ecosystem on Henesys', 'https://static-cdn.jtvnw.net/ttv-boxart/19976-285x380.jpg'),

-- IRL Categories
('IRL', 'irl', 'IRL', 'In Real Life streams - travel, events, and adventures', 'https://static-cdn.jtvnw.net/ttv-boxart/494717-285x380.jpg'),
('Music', 'music', 'Creative', 'Live music performances and production', 'https://static-cdn.jtvnw.net/ttv-boxart/26936-285x380.jpg'),
('Talk Shows & Podcasts', 'talk-shows', 'IRL', 'Live discussions, interviews, and podcasts', 'https://static-cdn.jtvnw.net/ttv-boxart/417752-285x380.jpg'),
('Fitness & Health', 'fitness', 'IRL', 'Workout streams, yoga, and health content', 'https://static-cdn.jtvnw.net/ttv-boxart/509671-285x380.jpg'),
('Food & Drink', 'food-drink', 'IRL', 'Cooking streams and food content', 'https://static-cdn.jtvnw.net/ttv-boxart/509667-285x380.jpg'),

-- More popular games
('Roblox', 'roblox', 'Sandbox', 'User-created games and experiences platform', 'https://static-cdn.jtvnw.net/ttv-boxart/23020_Roblox-285x380.jpg'),
('Genshin Impact', 'genshin-impact', 'Action RPG', 'Open-world action RPG with gacha elements', 'https://static-cdn.jtvnw.net/ttv-boxart/513181-285x380.jpg'),
('Honkai: Star Rail', 'honkai-star-rail', 'Turn-based RPG', 'Space fantasy RPG from the creators of Genshin Impact', 'https://static-cdn.jtvnw.net/ttv-boxart/1685657681-285x380.jpg'),
('Baldur''s Gate 3', 'baldurs-gate-3', 'RPG', 'Epic D&D-based RPG with deep choices and consequences', 'https://static-cdn.jtvnw.net/ttv-boxart/1678052513-285x380.jpg'),
('Sea of Thieves', 'sea-of-thieves', 'Adventure', 'Shared-world pirate adventure', 'https://static-cdn.jtvnw.net/ttv-boxart/490377-285x380.jpg'),
('Among Us', 'among-us', 'Party', 'Social deduction party game', 'https://static-cdn.jtvnw.net/ttv-boxart/510218-285x380.jpg'),
('Fall Guys', 'fall-guys', 'Party', 'Chaotic party royale obstacle course game', 'https://static-cdn.jtvnw.net/ttv-boxart/512980-285x380.jpg'),
('It Takes Two', 'it-takes-two', 'Co-op', 'Award-winning co-op adventure platformer', 'https://static-cdn.jtvnw.net/ttv-boxart/518232-285x380.jpg'),
('Satisfactory', 'satisfactory', 'Simulation', 'First-person factory building and exploration', 'https://static-cdn.jtvnw.net/ttv-boxart/499000-285x380.jpg'),
('Euro Truck Simulator 2', 'euro-truck-sim-2', 'Simulation', 'Relaxing truck driving across Europe', 'https://static-cdn.jtvnw.net/ttv-boxart/32307-285x380.jpg'),
('Stardew Valley', 'stardew-valley', 'Simulation', 'Charming farming and life simulation', 'https://static-cdn.jtvnw.net/ttv-boxart/490744-285x380.jpg'),
('The Sims 4', 'sims-4', 'Simulation', 'Life simulation with endless creative possibilities', 'https://static-cdn.jtvnw.net/ttv-boxart/369252-285x380.jpg'),
('Hades II', 'hades-2', 'Roguelike', 'Greek mythology roguelike action game', 'https://static-cdn.jtvnw.net/ttv-boxart/2048659117-285x380.jpg'),
('ARC Raiders', 'arc-raiders', 'Co-op Shooter', 'Free-to-play third-person co-op shooter', 'https://static-cdn.jtvnw.net/ttv-boxart/1863610862-285x380.jpg')
ON CONFLICT (slug) DO UPDATE SET 
  thumbnail_url = EXCLUDED.thumbnail_url,
  description = EXCLUDED.description,
  category = EXCLUDED.category;