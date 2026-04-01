import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { usersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGE = {
  owner:    'bg-purple-100 text-purple-800',
  employee: 'bg-blue-100 text-blue-800',
};

const TABS = ['Users', 'System Info', 'How To Use'];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', password: '', role: 'employee', email: '', phone: '' });
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (activeTab === 'Users') fetchUsers(); }, [activeTab, fetchUsers]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.password.trim()) { setFormError('Name and password are required'); return; }
    if (!form.email.trim()) { setFormError('Email is required (used for login)'); return; }
    setSaving(true);
    try {
      const created = await usersAPI.create(form);
      setUsers(p => [...p, created]);
      setShowModal(false);
      setForm({ name: '', password: '', role: 'employee', email: '', phone: '' });
      toast.success(`User "${created.name}" added successfully`);
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await usersAPI.delete(id);
      setUsers(p => p.filter(u => u.id !== id));
      toast.success(`"${name}" removed`);
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <DashboardLayout role="owner" pageTitle="Settings">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings & Admin Panel</h2>
        <p className="text-gray-500 mt-1">Manage users, view system status, and learn how things work</p>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-8 gap-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab
                ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab === 'Users' ? '👥 ' : tab === 'System Info' ? '🖥️ ' : '📖 '}{tab}
          </button>
        ))}
      </div>

      {/* ── TAB: Users ──────────────────────────────────────────────────────── */}
      {activeTab === 'Users' && (
        <div>
          {/* Quick Guide */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
            <span className="text-2xl">⚡</span>
            <div className="text-sm">
              <p className="font-semibold text-amber-900 mb-1">To add a new employee</p>
              <p className="text-amber-800">Click <strong>Add User</strong> below and set their name, email, and password. They sign in with that email and password on the login page.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Users', value: users.length, icon: '👥', color: 'text-gray-900' },
              { label: 'Owners', value: users.filter(u => u.role === 'owner').length, icon: '👑', color: 'text-purple-700' },
              { label: 'Employees', value: users.filter(u => u.role === 'employee').length, icon: '👤', color: 'text-blue-700' },
            ].map(s => (
              <div key={s.label} className="card p-4 flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">All Users</h3>
              <button onClick={() => setShowModal(true)} className="btn btn-primary py-2 px-4 text-sm">
                + Add User
              </button>
            </div>
            {loading ? (
              <p className="p-8 text-center text-gray-400">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Role', 'Action'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                              {u.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.name}</p>
                              {u.id === currentUser?.id && <p className="text-[10px] text-gray-400">You</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{u.email || <span className="text-gray-300">—</span>}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{u.phone || <span className="text-gray-300">—</span>}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {u.id !== currentUser?.id ? (
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              disabled={deleting === u.id}
                              className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                            >
                              {deleting === u.id ? 'Removing...' : 'Remove'}
                            </button>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: System Info ─────────────────────────────────────────────────── */}
      {activeTab === 'System Info' && (
        <div className="space-y-4">
          {[
            { label: 'Database',       value: 'SQLite (backend/db/retailflow.db)', icon: '🗃️', status: 'Active' },
            { label: 'Backend Server', value: 'Express.js on port 3001', icon: '⚙️', status: 'Running' },
            { label: 'Frontend',       value: 'React + Vite on port 5173', icon: '⚛️', status: 'Running' },
            { label: 'Auth Method',    value: 'Email + password → JWT (SQLite users)', icon: '🔒', status: 'Enabled' },
          ].map(item => (
            <div key={item.label} className="card p-5 flex items-center gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase font-semibold">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                {item.status}
              </span>
            </div>
          ))}

          <div className="card p-5 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Start Commands</h3>
            <div className="space-y-2">
              {[
                { label: 'Start everything', cmd: 'npm run dev:all' },
                { label: 'Start backend only', cmd: 'cd backend && node index.js' },
                { label: 'Start frontend only', cmd: 'cd frontend && npm run dev' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-36 flex-shrink-0">{c.label}:</span>
                  <code className="text-xs bg-gray-100 text-gray-800 px-3 py-1.5 rounded font-mono">{c.cmd}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: How To Use ──────────────────────────────────────────────────── */}
      {activeTab === 'How To Use' && (
        <div className="space-y-4">
          {[
            {
              icon: '🔑',
              title: 'How to add a new employee',
              color: 'border-blue-200 bg-blue-50',
              titleColor: 'text-blue-900',
              steps: [
                'Open the Users tab → click "Add User"',
                'Enter name, email, password, and role (Employee)',
                'They sign in at the login page with that email and password',
              ]
            },
            {
              icon: '🗑️',
              title: 'How to remove an employee',
              color: 'border-red-200 bg-red-50',
              titleColor: 'text-red-900',
              steps: [
                'Users tab → click "Remove" on their row',
                'They will no longer be able to log in',
              ]
            },
            {
              icon: '👤',
              title: 'Difference between Owner and Employee',
              color: 'border-purple-200 bg-purple-50',
              titleColor: 'text-purple-900',
              steps: [
                'Owner: Can see revenue, all sales, manage products, manage team',
                'Employee: Can only create bills (sell products) and see their own sales',
                'Owner sees: Dashboard + Sales History + Team + Settings',
                'Employee sees: Dashboard (with billing section only)',
              ]
            },
            {
              icon: '🏪',
              title: 'Setting up for a different deployment',
              color: 'border-green-200 bg-green-50',
              titleColor: 'text-green-900',
              steps: [
                'Copy the RetailFlow folder',
                'Delete backend/db/retailflow.db (or use a new file path) so the app re-seeds',
                'Set JWT_SECRET in backend/.env for production',
                'Run npm run dev:all to start frontend and API',
              ]
            },
          ].map(card => (
            <div key={card.title} className={`border rounded-xl p-5 ${card.color}`}>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${card.titleColor}`}>
                <span>{card.icon}</span> {card.title}
              </h3>
              <ol className="space-y-1.5 list-decimal list-inside">
                {card.steps.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700">{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {/* ── Add User Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Add New User</h3>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                Password must be at least 4 characters. Email is used to sign in on the login page.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">Username *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. rahul" required />
                </div>
                <div>
                  <label className="label block mb-1">Password *</label>
                  <input className="input" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="Min 4 chars" required />
                </div>
              </div>
              <div>
                <label className="label block mb-1">Email * <span className="text-red-500">(login)</span></label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="employee@yourshop.com" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">Role *</label>
                  <select className="input" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
                    <option value="employee">Employee</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="label block mb-1">Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="Optional" />
                </div>
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
