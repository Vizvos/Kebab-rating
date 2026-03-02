-- Tabulka Uživatelů
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,           -- Budeme používat náš vlastní string (např. CUID) 
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka Míst (Kebabáren)
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    rating REAL DEFAULT 0,
    creator_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabulka Hodnocení (Recenzí)
CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    place_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    food_name TEXT,
    score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_places_creator ON places(creator_id);
CREATE INDEX IF NOT EXISTS idx_ratings_place ON ratings(place_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
