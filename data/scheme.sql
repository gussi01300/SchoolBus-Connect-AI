CREATE TABLE IF NOT EXISTS buses (
    id INTEGER PRIMARY KEY,
    number INT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    address TEXT,
    bus_id INTEGER,
    stop_index INTEGER
);

CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    bus_id INTEGER
);

CREATE TABLE IF NOT EXISTS signouts (
    id INTEGER PRIMARY KEY,
    student_id INTEGER,
    date TEXT,
    UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS pickups (
    id INTEGER PRIMARY KEY,
    student_id INTEGER,
    date TEXT,
    picked_up_at TEXT
);

CREATE TABLE IF NOT EXISTS bus_progress (
    bus_id INTEGER PRIMARY KEY,
    current_stop_index INTEGER,
    last_update TEXT
);

CREATE TABLE IF NOT EXISTS routes (
    route_id INT PRIMARY KEY,
    bus_id INT,           -- Foreign key referencing the bus
    start_time TIME,      -- Optional: Start time for the route
    end_time TIME,        -- Optional: End time for the route
);

CREATE TABLE IF NOT EXISTS stops (
    stop_id INT PRIMARY KEY,
    stop_location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS route_stops (
    route_id INT,               -- Foreign key to routes table
    stop_id INT,                -- Foreign key to stops table
    stop_order INT,             -- The order of the stop in the route
    PRIMARY KEY (route_id, stop_id)
);