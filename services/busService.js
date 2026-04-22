const db = require('../data/db');
require('dotenv').config();
const data = require('../testUser.json'); //Test User
const studentServices = require('../services/studentServices');

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

function getCoordinates(stop_id) {
  const stmtCoordinates = db.prepare('SELECT latitude, longitude FROM stops WHERE id = ?');

  const { latitude: latitude, longitude: longitude } = stmtCoordinates.get(stop_id);

  const coordinates = `${longitude},${latitude}`;

  return coordinates;
}

function calculateSection(fromStopID, toStopID) {
  const duration = db
    .prepare('SELECT duration FROM times WHERE from_stop_id = ? AND to_stop_id = ?')
    .get(fromStopID, toStopID);
  return duration.duration;
}

function calculateETA(user) {
  const foundUser = studentServices.getStudentByID(user.id);

  const stmtBusLastUpdate = db.prepare('SELECT last_updated_at FROM bus_progress WHERE bus_id = ?');
  const { last_updated_at: lastUpdate } = stmtBusLastUpdate.get(foundUser.bus_id);

  const currentTime = Math.floor(Date.now() / 1000);

  const passedTime = currentTime - lastUpdate; //Time passed since last bus Update

  const stopID = foundUser.stop_id;

  const { stop_id: currentBusStopID } = db
    .prepare(
      `
    SELECT bs.stop_id
    FROM bus_progress bp
    JOIN bus_stops bs ON bs.stop_index = bp.current_stop_index
    WHERE bp.bus_id = ?`,
    )
    .get(foundUser.bus_id);

  const route = db
    .prepare(
      `
    WITH params AS (
    SELECT ? AS bus_id)
    SELECT stop_id
    FROM bus_stops, params
    WHERE bus_stops.bus_id = params.bus_id
      AND stop_index BETWEEN
        (SELECT stop_index FROM bus_stops WHERE bus_id = params.bus_id AND stop_id = ?)
      AND
        (SELECT stop_index FROM bus_stops WHERE bus_id = params.bus_id AND stop_id = ?)
    ORDER BY stop_index;`,
    )
    .all(foundUser.bus_id, currentBusStopID, stopID);

  const durations = [];

  const timeNeeded = calculateSection(route[0].stop_id, route[1].stop_id);
  if (timeNeeded - passedTime < 0) {
    //Error
  } else {
    durations.push(Math.round(timeNeeded - passedTime));
  }

  //Debugging
  console.log(`User: ${foundUser.username} with ID: ${foundUser.id}`);
  console.log(route);
  console.log(`on the Bus: ${foundUser.bus_id}`);

  route.shift();

  const routeLength = route.length;
  // refactor taht so that after every query, route.shift()
  for (let i = 0; i < routeLength; i++) {
    if (route[i + 1]) {
      const duration = db
        .prepare('SELECT duration FROM times WHERE from_stop_id = ? AND to_stop_id = ?')
        .get(route[i].stop_id, route[i + 1].stop_id);
      durations.push(Math.round(duration.duration));
    }
  }

  let totalTime = 0;
  for (const time of durations) {
    totalTime += time;
  }

  console.log(`and has the total time of ${totalTime} until his Bus arrives.`);
  return totalTime;
}

module.exports = {
  getRouteTime,
  calculateETA,
};
