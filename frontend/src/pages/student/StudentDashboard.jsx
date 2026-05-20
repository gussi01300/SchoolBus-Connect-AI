import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import { useSSE } from '../../hooks/useSSE';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [eta, setEta] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [signOutType, setSignOutType] = useState('today');
  const [signOutDate, setSignOutDate] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [busLocation, setBusLocation] = useState(null);

  const { connected: sseConnected } = useSSE(studentApi.getBusLiveUrl(), (data) => {
    setBusLocation(data);
  });

  useEffect(() => {
    loadETA();
  }, []);

  async function loadETA() {
    try {
      const data = await studentApi.getETA();
      setEta(data.ETA);
      setMessage(data.message);
    } catch (e) {
      setMessage('Could not load ETA');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const untilDate = signOutType === 'date' ? signOutDate : null;
      await studentApi.signOut(untilDate);
      alert('Signed out successfully');
      navigate('/login');
      await logout();
    } catch (e) {
      alert('Failed to sign out: ' + e.message);
    } finally {
      setSigningOut(false);
    }
  }

  function formatTime(seconds) {
    if (seconds == null) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    return `${mins}m ${secs}s`;
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome, {user.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Bus ETA</h2>
              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold text-blue-600">{formatTime(eta)}</div>
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">Status</div>
                  <div className="text-slate-700">{message || 'Loading...'}</div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${sseConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                  {sseConnected ? 'Live' : 'Offline'}
                </div>
              </div>
            </div>

            {busLocation && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Bus Location</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Coordinates</div>
                    <div className="text-slate-700 font-mono">
                      {typeof busLocation.latitude === 'number' ? busLocation.latitude.toFixed(4) : busLocation.latitude}, {typeof busLocation.longitude === 'number' ? busLocation.longitude.toFixed(4) : busLocation.longitude}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Last Updated</div>
                    <div className="text-slate-700">
                      {busLocation.timestamp ? new Date(busLocation.timestamp).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Sign Out</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="signOutType"
                      value="today"
                      checked={signOutType === 'today'}
                      onChange={() => setSignOutType('today')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Sign out today only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="signOutType"
                      value="date"
                      checked={signOutType === 'date'}
                      onChange={() => setSignOutType('date')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Sign out until date</span>
                  </label>
                </div>

                {signOutType === 'date' && (
                  <input
                    type="date"
                    value={signOutDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSignOutDate(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                )}

                <button
                  onClick={handleSignOut}
                  disabled={signingOut || (signOutType === 'date' && !signOutDate)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition"
                >
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}