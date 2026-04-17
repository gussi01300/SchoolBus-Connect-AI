PRAGMA foreign_keys = ON;

-- =========================
-- TABLE: drivers
-- =========================
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT
);

-- =========================
-- TABLE: buses
-- =========================
CREATE TABLE buses (
    id INTEGER PRIMARY KEY,
    bus_number TEXT NOT NULL UNIQUE,
    driver_id INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- =========================
-- TABLE: stops
-- =========================
CREATE TABLE stops (
    id INTEGER PRIMARY KEY,
    stop_name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL
);

-- =========================
-- TABLE: bus_stops
-- Connects buses to stops in order
-- =========================
CREATE TABLE bus_stops (
    id INTEGER PRIMARY KEY,
    bus_id INTEGER NOT NULL,
    stop_id INTEGER NOT NULL,
    stop_index INTEGER NOT NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
    UNIQUE (bus_id, stop_index),
    UNIQUE (bus_id, stop_id)
);

-- =========================
-- TABLE: students
-- =========================
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    bus_id INTEGER NOT NULL,
    stop_id INTEGER NOT NULL,
    signed_out INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (stop_id) REFERENCES stops(id)
);

-- =========================
-- TABLE: bus_progress
-- Stores the current progress of each bus
-- =========================
CREATE TABLE bus_progress (
  bus_id INTEGER PRIMARY KEY,
  current_stop_index INTEGER NOT NULL DEFAULT 0,
  last_updated_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

-- =========================
-- OPTIONAL INDEXES
-- =========================
CREATE INDEX idx_students_bus_id ON students(bus_id);
CREATE INDEX idx_students_stop_id ON students(stop_id);
CREATE INDEX idx_bus_stops_bus_id ON bus_stops(bus_id);
CREATE INDEX idx_bus_stops_stop_id ON bus_stops(stop_id);