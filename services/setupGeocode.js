const db = require('../data/db');
require('dotenv').config();

async function getStopsFromDB() {
  const stmt = db.prepare(
    'SELECT * FROM stops WHERE latitude IS NULL OR longitude IS NULL',
  );
  const missingStops = stmt.all();

  console.log(missingStops);
  const len = missingStops.length;

  for (let i = 0; i < len; i++) {
    const missingLatLong = await getCoords(missingStops[i].address);

    console.log(missingStops[i].address);
    console.log(missingLatLong);

    const lat = missingLatLong[1];
    const lng = missingLatLong[0];
    console.log(lat);
    console.log(lng);

    const stmt = db.prepare(
      'UPDATE stops SET latitude = ?, longitude = ? WHERE address = ?',
    );

    stmt.run(lat, lng, missingStops[i].address);
  }
}

async function getCoords(address) {
  const API_KEY = process.env.API_KEY;

  const params = new URLSearchParams({
    api_key: API_KEY,
    text: address,
    'boundrary.country': 'CA',
    'boundary.country': 'CA',
    'focus.point.lon': -66.5,
    'focus.point.lat': 47.9,
    'boundary.rect.min_lon': -67.5,
    'boundary.rect.min_lat': 47.5,
    'boundary.rect.max_lon': -65.5,
    'boundary.rect.max_lat': 48.5,
    size: 1,
  });

  const url = `https://api.openrouteservice.org/geocode/search?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.features[0].geometry.coordinates;
}

getStopsFromDB();
