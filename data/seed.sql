-- =========================
-- DRIVERS
-- =========================
INSERT INTO drivers (id, username, password_hash, full_name) VALUES
(1, 'driver1', '$2b$10$f9rtv0C2kQcIUzza8Mbm8.I2zK9PboKrJvdvHno9CGMhtBDoshX5K', 'Max Mustermann');

-- =========================
-- BUSES
-- =========================
INSERT INTO buses (id, bus_number, driver_id, active) VALUES
(408, 'Bus 408', 1, 1);

-- =========================
-- STOPS
-- =========================
INSERT INTO stops (id, stop_name, address) VALUES
(1, '737 Chaleur St', '737 Chaleur St'),
(2, '6 Laviolette St', '6 Laviolette St'),
(3, '534 Chaleur St', '534 Chaleur St'),
(4, '1 Sunset Dr', '1 Sunset Dr'),
(5, '347 Dillon Ave', '347 Dillon Ave');

-- =========================
-- BUS ROUTE (bus_stops)
-- Reihenfolge ist wichtig!
-- =========================
INSERT INTO bus_stops (bus_id, stop_id, stop_index) VALUES
(408, 1, 0),
(408, 2, 1),
(408, 4, 2),
(408, 5, 3),
(408, 3, 4); -- Schule am Ende

-- =========================
-- STUDENTS
-- (password_hash lässt du später selbst setzen)
-- =========================
INSERT INTO students (id, username, password_hash, full_name, bus_id, stop_id) VALUES
(1, 'lars1', '$2b$10$f9rtv0C2kQcIUzza8Mbm8.I2zK9PboKrJvdvHno9CGMhtBDoshX5K', 'Lars Müller', 408, 2),
(2, 'lars2', '$2b$10$f9rtv0C2kQcIUzza8Mbm8.I2zK9PboKrJvdvHno9CGMhtBDoshX5K', 'Lars Schmidt', 408, 4),
(3, 'lars3', '$2b$10$f9rtv0C2kQcIUzza8Mbm8.I2zK9PboKrJvdvHno9CGMhtBDoshX5K', 'Lars Fischer', 408, 5);

-- =========================
-- BUS PROGRESS
-- =========================
INSERT INTO bus_progress (bus_id, current_stop_index) VALUES
(408, 1);