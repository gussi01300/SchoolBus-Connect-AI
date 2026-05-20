import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const TABS = ['buses', 'stops', 'students', 'drivers', 'routes'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('buses');
  const [data, setData] = useState({ buses: [], stops: [], students: [], drivers: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState({ type: null, id: null, data: {} });
  const [modalError, setModalError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setLoadError(null);
    try {
      const [buses, stops, students, drivers] = await Promise.all([
        adminApi.getBuses(),
        adminApi.getStops(),
        adminApi.getStudents(),
        adminApi.getDrivers(),
      ]);
      setData({ buses, stops, students, drivers });
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function validateModal() {
    const d = modalState.data;
    if (modalState.type === 'bus' && !d.busNumber?.trim()) return 'Bus number is required';
    if (modalState.type === 'stop' && (!d.stopName?.trim() || !d.address?.trim())) return 'Stop name and address are required';
    if (modalState.type === 'stop' && (isNaN(d.latitude) || isNaN(d.longitude))) return 'Valid coordinates are required';
    if (modalState.type === 'student' && (!d.fullName?.trim() || !d.busId || !d.stopId)) return 'Full name, bus, and stop are required';
    if (modalState.type === 'student' && !modalState.id && (!d.username?.trim() || !d.password)) return 'Username and password are required';
    if (modalState.type === 'driver' && (!d.fullName?.trim() || !d.username?.trim())) return 'Full name and username are required';
    if (modalState.type === 'driver' && !modalState.id && !d.password) return 'Password is required';
    return null;
  }

  async function handleSave() {
    const validationError = validateModal();
    if (validationError) {
      setModalError(validationError);
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (modalState.type === 'bus') {
        if (modalState.id) await adminApi.updateBus(modalState.id, modalState.data.busNumber, modalState.data.driverId || null);
        else await adminApi.createBus(modalState.data.busNumber, modalState.data.driverId || null);
      } else if (modalState.type === 'stop') {
        if (modalState.id) await adminApi.updateStop(modalState.id, modalState.data.stopName, modalState.data.address, modalState.data.latitude, modalState.data.longitude);
        else await adminApi.createStop(modalState.data.stopName, modalState.data.address, modalState.data.latitude, modalState.data.longitude);
      } else if (modalState.type === 'student') {
        if (modalState.id) await adminApi.updateStudent(modalState.id, modalState.data.fullName, modalState.data.busId, modalState.data.stopId, modalState.data.signedOut);
        else await adminApi.createStudent(modalState.data.username, modalState.data.password, modalState.data.fullName, modalState.data.busId, modalState.data.stopId);
      } else if (modalState.type === 'driver') {
        if (modalState.id) await adminApi.updateDriver(modalState.id, modalState.data.fullName, modalState.data.username);
        else await adminApi.createDriver(modalState.data.username, modalState.data.password, modalState.data.fullName);
      }
      setShowModal(false);
      setModalState({ type: null, id: null, data: {} });
      await loadAll();
    } catch (e) {
      setModalError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'bus') await adminApi.deleteBus(id);
      else if (type === 'stop') await adminApi.deleteStop(id);
      else if (type === 'student') await adminApi.deleteStudent(id);
      else if (type === 'driver') await adminApi.deleteDriver(id);
      await loadAll();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function openModal(type, item = null) {
    setModalError(null);
    if (item) {
      setModalState({ type, id: item.id, data: { ...item } });
    } else {
      setModalState({ type, id: null, data: {} });
    }
    setShowModal(true);
  }

  function setModalField(key, value) {
    setModalState((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="font-bold text-lg text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">SchoolBus Connect</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition ${
                tab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 capitalize">{tab}</h2>
          {tab !== 'routes' && (
            <button
              onClick={() => openModal(tab === 'students' ? 'student' : tab === 'buses' ? 'bus' : tab === 'stops' ? 'stop' : 'driver')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              + Add {tab === 'students' ? 'Student' : tab === 'buses' ? 'Bus' : tab === 'stops' ? 'Stop' : 'Driver'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium mb-2">Failed to load data</p>
            <p className="text-red-500 text-sm mb-4">{loadError}</p>
            <button onClick={loadAll} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">Retry</button>
          </div>
        ) : (
          <>
            {tab === 'buses' && <BusesTable data={data.buses} onEdit={(b) => openModal('bus', b)} onDelete={(id) => handleDelete('bus', id)} drivers={data.drivers} />}
            {tab === 'stops' && <StopsTable data={data.stops} onEdit={(s) => openModal('stop', s)} onDelete={(id) => handleDelete('stop', id)} />}
            {tab === 'students' && <StudentsTable data={data.students} onEdit={(s) => openModal('student', s)} onDelete={(id) => handleDelete('student', id)} buses={data.buses} stops={data.stops} />}
            {tab === 'drivers' && <DriversTable data={data.drivers} onEdit={(d) => openModal('driver', d)} onDelete={(id) => handleDelete('driver', id)} />}
            {tab === 'routes' && <RoutesManager buses={data.buses} stops={data.stops} />}
          </>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {modalState.id ? 'Edit' : 'Add'} {modalState.type.charAt(0).toUpperCase() + modalState.type.slice(1)}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{modalError}</div>
              )}
              <ModalFields modal={modalState} data={data} onChange={setModalField} />
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BusesTable({ data, onEdit, onDelete, drivers }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bus Number</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-500">{b.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{b.bus_number}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{b.driver_id ? drivers.find((d) => d.id === b.driver_id)?.full_name : 'None'}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(b)} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">Edit</button>
                <button onClick={() => onDelete(b.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition">Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No buses yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StopsTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Address</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Coordinates</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-500">{s.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.stop_name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{s.address}</td>
              <td className="px-6 py-4 text-sm text-slate-500 font-mono">{s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(s)} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">Edit</button>
                <button onClick={() => onDelete(s.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition">Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No stops yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StudentsTable({ data, onEdit, onDelete, buses, stops }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Username</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bus</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Stop</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Signed Out</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-500">{s.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.full_name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{s.username}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{buses.find((b) => b.id === s.bus_id)?.bus_number || s.bus_id}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{stops.find((st) => st.id === s.stop_id)?.stop_name || s.stop_id}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${s.signed_out ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {s.signed_out ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(s)} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">Edit</button>
                <button onClick={() => onDelete(s.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition">Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No students yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DriversTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Username</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-500">{d.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{d.full_name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{d.username}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(d)} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">Edit</button>
                <button onClick={() => onDelete(d.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition">Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No drivers yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ModalFields({ modal, data, onChange }) {
  const { type, id, data: d } = modal;
  if (type === 'bus') return (
    <>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Bus Number</label>
        <input type="text" value={d.busNumber || ''} onChange={(e) => onChange('busNumber', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
        <select value={d.driverId || ''} onChange={(e) => onChange('driverId', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">None</option>
          {data.drivers.map((dr) => <option key={dr.id} value={dr.id}>{dr.full_name}</option>)}
        </select>
      </div>
    </>
  );
  if (type === 'stop') return (
    <>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Stop Name</label>
        <input type="text" value={d.stopName || ''} onChange={(e) => onChange('stopName', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <input type="text" value={d.address || ''} onChange={(e) => onChange('address', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
          <input type="number" step="any" value={d.latitude || ''} onChange={(e) => onChange('latitude', parseFloat(e.target.value) || '')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
          <input type="number" step="any" value={d.longitude || ''} onChange={(e) => onChange('longitude', parseFloat(e.target.value) || '')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </>
  );
  if (type === 'student') return (
    <>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input type="text" value={d.full_name || d.fullName || ''} onChange={(e) => onChange('fullName', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      {!id && <>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input type="text" value={d.username || ''} onChange={(e) => onChange('username', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" value={d.password || ''} onChange={(e) => onChange('password', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </>}
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Bus</label>
        <select value={d.bus_id || d.busId || ''} onChange={(e) => onChange('busId', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select bus...</option>
          {data.buses.map((b) => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Stop</label>
        <select value={d.stop_id || d.stopId || ''} onChange={(e) => onChange('stopId', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select stop...</option>
          {data.stops.map((s) => <option key={s.id} value={s.id}>{s.stop_name}</option>)}
        </select>
      </div>
    </>
  );
  if (type === 'driver') return (
    <>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input type="text" value={d.full_name || d.fullName || ''} onChange={(e) => onChange('fullName', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
        <input type="text" value={d.username || ''} onChange={(e) => onChange('username', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      {!id && <div><label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input type="password" value={d.password || ''} onChange={(e) => onChange('password', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>}
    </>
  );
  return null;
}

function RoutesManager({ buses, stops }) {
  const [selectedBusId, setSelectedBusId] = useState('');
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingStopId, setAddingStopId] = useState('');

  useEffect(() => {
    if (selectedBusId) loadRoute();
  }, [selectedBusId]);

  async function loadRoute() {
    setLoading(true);
    try {
      const data = await adminApi.getBusRoute(selectedBusId);
      setRoute(data);
    } catch (e) {
      setRoute([]);
    } finally {
      setLoading(false);
    }
  }

  async function addStop() {
    if (!addingStopId) return;
    const newStopIds = [...route.map((r) => r.stop_id), parseInt(addingStopId)];
    await adminApi.setBusRoute(parseInt(selectedBusId), newStopIds);
    setAddingStopId('');
    await loadRoute();
  }

  async function removeStop(stopId) {
    const newStopIds = route.filter((r) => r.stop_id !== stopId).map((r) => r.stop_id);
    await adminApi.setBusRoute(parseInt(selectedBusId), newStopIds);
    await loadRoute();
  }

  const assignedStopIds = route.map((r) => r.stop_id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Bus</label>
        <select
          value={selectedBusId}
          onChange={(e) => setSelectedBusId(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select a bus...</option>
          {buses.map((b) => (
            <option key={b.id} value={b.id}>{b.bus_number}</option>
          ))}
        </select>
      </div>

      {selectedBusId && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Current Route</h3>
          <div className="space-y-2 mb-6">
            {route.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No stops assigned</p>
            ) : (
              route.map((r, i) => (
                <div key={r.stop_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                    <div>
                      <div className="font-medium text-slate-900">{r.stop_name}</div>
                      <div className="text-sm text-slate-500">{r.address}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStop(r.stop_id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <h3 className="font-semibold text-slate-900 mb-4">Add Stop</h3>
          <div className="flex gap-3">
            <select
              value={addingStopId}
              onChange={(e) => setAddingStopId(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select a stop...</option>
              {stops.filter((s) => !assignedStopIds.includes(s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.stop_name} - {s.address}</option>
              ))}
            </select>
            <button
              onClick={addStop}
              disabled={!addingStopId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}