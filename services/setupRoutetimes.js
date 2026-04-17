const db = require('../data/db');
const route = require('./busService');

// routeTimes.getRouteTime();

async function Main() {
  const BusNumber = 408;
  const allStops = db
    .prepare('SELECT stop_id, stop_index FROM bus_stops WHERE bus_id = ? ORDER BY stop_index')
    .all(BusNumber);
  console.log(BusNumber);

  const numberOfStops = allStops.length;
  const testTimes = [];

  for (let i = 0; i < numberOfStops; i++) {
    if (allStops[i + 1]) {
      const fromStop = allStops[i].stop_id;
      const toStop = allStops[i + 1].stop_id;

      const { latitude: fromLat, longitude: fromLng } = db
        .prepare('SELECT latitude, longitude FROM stops WHERE id = ?')
        .get(fromStop);

      //Formatting coordinates for API
      const fromCoordinates = `${fromLng},${fromLat}`;

      const { latitude: toLat, longitude: toLng } = db
        .prepare('SELECT latitude, longitude FROM stops WHERE id = ?')
        .get(toStop);

      //Formatting coordinates for API
      const toCoordinates = `${toLng},${toLat}`;

      console.log(`From ${fromStop} to ${toStop} (${allStops[i].stop_index})`);
      console.log(`From ${fromCoordinates} to ${toCoordinates}`);

      const timeNeeded = await route.getRouteTime(fromCoordinates, toCoordinates);

      testTimes.push(timeNeeded);
      //Run query to save times in db
    }
  }
  //   console.log(allStops);
}

Main();
