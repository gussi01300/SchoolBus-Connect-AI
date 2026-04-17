db = require('../data/db');
require('dotenv').config();
const data = require('../testUser.json'); //Test User

// function getBusStatus(BusID) {
//   return db.prepare('SELECT * FROM bus_progress WHERE bus_id = ?').get(BusID);
// }

async function getTime(startCoords, endCoords) {
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
    throw new Error('Request failed');
  }

  const data = await res.json();

  // Return the ETA (duration) in seconds
  return data.features[0].properties.summary.duration; // ETA is in seconds
}

async function calculateETA(user) {
  //Get current bus stop and when it was updated.
  const stmtBusLastUpdate = db.prepare('SELECT last_updated_at FROM bus_progress WHERE bus_id = ?');
  const { last_updated_at: lastUpdate } = stmtBusLastUpdate.get(user.bus_id);

  //Get latitude and longitude from current bus stop
  const stmtCurrentBusCoordinates = db.prepare(
    `SELECT s.latitude, s.longitude
    FROM bus_progress bp 
    JOIN bus_stops bs ON bp.bus_id = bs.bus_id 
    AND bp.current_stop_index = bs.stop_index 
    JOIN stops s ON bs.stop_id = s.id 
    WHERE bp.bus_id = ?`,
  );

  const { latitude: currentBusLatitude, longitude: currentBusLongitude } = stmtCurrentBusCoordinates.get(user.bus_id);

  const busCoordinates = `${currentBusLongitude},${currentBusLatitude}`;

  //Get students stop location

  const stmtUserCoordinates = db.prepare(
    `SELECT s.latitude, s.longitude 
    FROM students st 
    JOIN stops s ON st.stop_id = s.id 
    WHERE st.username = ?`,
  );

  const { latitude: userLatitude, longitude: userLongitude } = stmtUserCoordinates.get(user.username);

  // console.log(studentLat);
  // console.log(studentLng);

  const studentCoordinates = `${userLongitude},${userLatitude}`;

  console.log(
    `Bus Coordinates: ${busCoordinates} at ${new Date(lastUpdate * 1000).toLocaleString()}, Student Coordinates: ${studentCoordinates}`,
  );

  const needetTime = await getTime(busCoordinates, studentCoordinates);
  console.log(`Takes ${needetTime} for the bus to arrive`);

  const currentTime = Math.floor(Date.now() / 1000);

  const timeDifference = currentTime - lastUpdate; // Time difference of the last updated location of the bus and the current Time in seconds.

  if (timeDifference > needetTime) {
    return 'The bus should have already passed your house.';
  } else {
    const arrivesIn = needetTime - timeDifference;
    return `arrives in: ${arrivesIn}`;
  }
}

async function TEST() {
  console.log(await calculateETA(data));
}

TEST();
