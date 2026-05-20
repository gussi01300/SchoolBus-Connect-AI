const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(data.message || 'Request failed');
  }
  return res.json();
}

// Student API
export const studentApi = {
  login: (username, password) =>
    request('/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request('/student/logout', { method: 'POST' }),
  getStatus: () => request('/student/login/status'),
  getETA: () => request('/student/getETA'),
  signOut: (untilDate) =>
    request('/student/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ untilDate }),
    }),
  getBusLiveUrl: () => `${API_BASE}/student/bus/live`,
};

// Driver API
export const driverApi = {
  login: (username, password) =>
    request('/driver/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request('/driver/logout', { method: 'POST' }),
  getStatus: () => request('/driver/loginStatus'),
  getNextStop: () => request('/driver/next-stop'),
  markPickup: (stopId) =>
    request('/driver/pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopId }),
    }),
  updateLocation: (latitude, longitude, source) =>
    request('/driver/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, source }),
    }),
};

// Admin API
export const adminApi = {
  login: (username, password) =>
    request('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request('/admin/logout', { method: 'POST' }),
  getStatus: () => request('/admin/login/status'),
  getBuses: () => request('/admin/buses'),
  createBus: (busNumber, driverId) =>
    request('/admin/buses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busNumber, driverId }),
    }),
  updateBus: (id, busNumber, driverId) =>
    request(`/admin/buses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busNumber, driverId }),
    }),
  deleteBus: (id) => request(`/admin/buses/${id}`, { method: 'DELETE' }),
  getStops: () => request('/admin/stops'),
  createStop: (stopName, address, latitude, longitude) =>
    request('/admin/stops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopName, address, latitude, longitude }),
    }),
  updateStop: (id, stopName, address, latitude, longitude) =>
    request(`/admin/stops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopName, address, latitude, longitude }),
    }),
  deleteStop: (id) => request(`/admin/stops/${id}`, { method: 'DELETE' }),
  getStudents: () => request('/admin/students'),
  createStudent: (username, password, fullName, busId, stopId) =>
    request('/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName, busId, stopId }),
    }),
  updateStudent: (id, fullName, busId, stopId, signedOut) =>
    request(`/admin/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, busId, stopId, signedOut }),
    }),
  deleteStudent: (id) => request(`/admin/students/${id}`, { method: 'DELETE' }),
  getDrivers: () => request('/admin/drivers'),
  createDriver: (username, password, fullName) =>
    request('/admin/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName }),
    }),
  updateDriver: (id, fullName, username) =>
    request(`/admin/drivers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, username }),
    }),
  deleteDriver: (id) => request(`/admin/drivers/${id}`, { method: 'DELETE' }),
  getBusRoute: (busId) => request(`/admin/routes/${busId}`),
  setBusRoute: (busId, stopIds) =>
    request(`/admin/routes/${busId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopIds }),
    }),
};