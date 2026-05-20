import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nextStop, setNextStop] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsWaiting, setStudentsWaiting] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [connected, setConnected] = useState(true);
  const watchIdRef = useRef(null);

  useEffect(() => {
    loadNextStop();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (locationEnabled && navigator.geolocation) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [locationEnabled]);

  async function loadNextStop() {
    try {
      const data = await driverApi.getNextStop();
      setNextStop(data.stop);
      setStudents(data.students || []);
      setStudentsWaiting(data.studentsWaiting || 0);
    } catch (e) {
      setNextStop(null);
    } finally {
      setLoading(false);
    }
  }

  function startLocationTracking() {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setConnected(true);
        sendLocation(position.coords.latitude, position.coords.longitude, 'geolocation');
      },
      () => {
        setConnected(false);
        sendLocation(0, 0, 'fallback');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  function stopLocationTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }

  async function sendLocation(lat, lon, source) {
    try {
      await driverApi.updateLocation(lat, lon, source);
    } catch (e) {
      console.warn('Location update failed:', e);
    }
  }

  async function handlePickup() {
    if (!nextStop) return;
    setPickingUp(true);
    try {
      const res = await driverApi.markPickup(nextStop.id);
      alert(`Marked ${res.count} student${res.count !== 1 ? 's' : ''} as picked up`);
      loadNextStop();
    } catch (e) {
      alert('Failed to mark pickup: ' + e.message);
    } finally {
      setPickingUp(false);
    }
  }

  async function handleLogout() {
    stopLocationTracking();
    await logout();
    navigate('/login');
  }

  const isRouteComplete = !nextStop;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Driver Dashboard</h1>
            <p className="text-sm text-slate-400">@{user.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-slate-500'}`}></span>
              {connected ? 'Live' : 'Offline'}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <label className="flex items-center justify-between p-4 bg-slate-800 rounded-xl cursor-pointer">
            <span className="text-sm font-medium">Share Location</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={locationEnabled}
                onChange={(e) => setLocationEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition ${locationEnabled ? 'bg-cyan-600' : 'bg-slate-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition mt-0.5 ${locationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
          </div>
        ) : isRouteComplete ? (
          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Route Complete!</h2>
            <p className="text-slate-400">All stops have been served.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-6">
              <div className="text-sm uppercase tracking-wider text-cyan-100 mb-2">Next Stop</div>
              <div className="text-3xl font-bold mb-1">{nextStop?.address}</div>
              <div className="text-cyan-100">{nextStop?.stop_name}</div>

              {studentsWaiting > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {studentsWaiting}
                  </span>
                  <span>Student{studentsWaiting > 1 ? 's' : ''} waiting</span>
                </div>
              )}

              <button
                onClick={handlePickup}
                disabled={pickingUp}
                className={`mt-6 w-full min-h-[80px] text-2xl font-bold rounded-xl transition-all transform ${
                  pickingUp
                    ? 'bg-slate-400 text-slate-200'
                    : studentsWaiting > 0
                    ? 'bg-white text-slate-900 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-600 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {pickingUp ? 'Processing...' : studentsWaiting > 0 ? 'PICKED UP' : 'Continue'}
              </button>
            </div>

            {students.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Students at this stop</h3>
                <div className="space-y-2">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="font-medium">{s.full_name}</span>
                      <span className="text-green-400 text-sm">Picked up</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}