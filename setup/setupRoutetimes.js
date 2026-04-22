const db = require('../data/db');
require('dotenv').config();

function saveTime(bus_id, fromStop, toStop, time) {
  db.prepare('INSERT INTO times (bus_id, from_stop_id, to_stop_id, duration) VALUES (?, ?, ?, ?)').run(
    bus_id,
    fromStop,
    toStop,
    time,
  );
  console.log(`Saved`);
}

async function getRouteTime(startCoords, endCoords) {
  const API_KEY = process.env.API_KEY;

  const params = new URLSearchParams({
    api_key: API_KEY,
    start: startCoords,
    end: endCoords,
  });

  // Build the URL with the coordinates and API key
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?${params}`;

  // Fetch data from OpenRouteService API
  const res = await fetch(url);

  if (!res.ok) {
    console.log(res);
    throw new Error('Request failed');
  }

  const data = await res.json();

  // Return the ETA (duration) in seconds
  return data.features[0].properties.summary.duration; // ETA is in seconds
}

async function calculateDuration(bus_id) {
  //Get all stops for specific bus
  const allStops = db
    .prepare('SELECT stop_id, stop_index FROM bus_stops WHERE bus_id = ? ORDER BY stop_index')
    .all(bus_id);
  console.log(bus_id);

  const numberOfStops = allStops.length;

  //iterating over the stops
  for (let i = 0; i < numberOfStops; i++) {
    if (allStops[i + 1]) {
      const fromStop = allStops[i].stop_id;
      const toStop = allStops[i + 1].stop_id;

      //Getting Coordinates from DB
      const { latitude: fromLat, longitude: fromLng } = db
        .prepare('SELECT latitude, longitude FROM stops WHERE id = ?')
        .get(fromStop);

      //Formatting coordinates for API
      const fromCoordinates = `${fromLng},${fromLat}`;

      //Getting Coordinates from DB
      const { latitude: toLat, longitude: toLng } = db
        .prepare('SELECT latitude, longitude FROM stops WHERE id = ?')
        .get(toStop);

      //Formatting coordinates for API
      const toCoordinates = `${toLng},${toLat}`;

      //Debug
      console.log(`From ${fromStop} to ${toStop} (${allStops[i].stop_index})`);
      console.log(`From ${fromCoordinates} to ${toCoordinates}`);

      const timeNeeded = await getRouteTime(fromCoordinates, toCoordinates);
      console.log(timeNeeded);

      try {
        saveTime(bus_id, fromStop, toStop, timeNeeded);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`Duplicate entry for bus ${bus_id}, from stop ${fromStop} to stop ${toStop}. Skipping.`);
        } else {
          console.error('Error saving to database:', error);
        }
      }
    }
  }
}

function main() {
  const allBuses = db.prepare('SELECT id FROM buses').all();
  for (let bus of allBuses) {
    calculateDuration(bus.id);
  }
}

main();
