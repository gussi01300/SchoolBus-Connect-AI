db = require('../data/db');
require('dotenv').config();
const data = require('../testUser.json'); //Test User

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
    throw new Error('Request failed');
  }

  const data = await res.json();

  // Return the ETA (duration) in seconds
  return data.features[0].properties.summary.duration; // ETA is in seconds
}

async function calculateETA(user) {
  //Get current coordinates of bus and student.
  const { studentCoordinates, busCoordinates } = getCoordinates(user);

  if (studentCoordinates == busCoordinates) {
    return {
      status: 'passed',
      etaSeconds: null,
    };
  }

  //Get current bus stop and when it was updated.
  const stmtBusLastUpdate = db.prepare('SELECT last_updated_at FROM bus_progress WHERE bus_id = ?');
  const { last_updated_at: lastUpdate } = stmtBusLastUpdate.get(user.bus_id);

  console.log(
    `Bus Coordinates: ${busCoordinates} at ${new Date(lastUpdate * 1000).toLocaleString()}, Student Coordinates: ${studentCoordinates}`,
  );

  const needetTime = await getRouteTime(busCoordinates, studentCoordinates);
  console.log(`Takes ${needetTime} for the bus to arrive`);

  const currentTime = Math.floor(Date.now() / 1000);

  const timeDifference = currentTime - lastUpdate; // Time difference of the last updated location of the bus and the current Time in seconds.

  const arrivesIn = needetTime - timeDifference;

  if (timeDifference > needetTime) {
    return {
      status: 'passed',
      etaSeconds: null,
    };
  } else {
    return {
      status: 'upcoming',
      etaSeconds: arrivesIn,
    };
  }
}

function getCoordinates(user) {
  //Get bus coordinates
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

  //Get students coordinates
  const stmtUserCoordinates = db.prepare(
    `SELECT s.latitude, s.longitude 
    FROM students st 
    JOIN stops s ON st.stop_id = s.id 
    WHERE st.username = ?`,
  );

  const { latitude: userLatitude, longitude: userLongitude } = stmtUserCoordinates.get(user.username);
  const studentCoordinates = `${userLongitude},${userLatitude}`;

  return { studentCoordinates: studentCoordinates, busCoordinates: busCoordinates };
}

async function TEST() {
  console.log(await calculateETA(data));
}

// TEST();

module.exports = { getRouteTime };
