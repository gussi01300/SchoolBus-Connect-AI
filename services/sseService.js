const clients = new Map();
const heartbeats = new Map();

function addClient(busId, res) {
  if (!clients.has(busId)) {
    clients.set(busId, new Set());
  }
  clients.get(busId).add(res);

  if (!heartbeats.has(busId)) {
    heartbeats.set(busId, setInterval(() => {
      if (clients.has(busId)) {
        clients.get(busId).forEach(clientRes => {
          clientRes.write(': ping\n\n');
        });
      }
    }, 30000));
  }
}

function removeClient(busId, res) {
  if (clients.has(busId)) {
    clients.get(busId).delete(res);
    if (clients.get(busId).size === 0) {
      clients.delete(busId);
      if (heartbeats.has(busId)) {
        clearInterval(heartbeats.get(busId));
        heartbeats.delete(busId);
      }
    }
  }
}

function broadcastLocation(busId, locationData) {
  if (clients.has(busId)) {
    const message = `data: ${JSON.stringify(locationData)}\n\n`;
    clients.get(busId).forEach(res => {
      res.write(message);
    });
  }
}

module.exports = { addClient, removeClient, broadcastLocation };