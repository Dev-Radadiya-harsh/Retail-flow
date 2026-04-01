import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { usersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGE = {
  owner:    'bg-purple-100 text-purple-800',
  employee: 'bg-blue-100 text-blue-800',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', password: '', role: 'employee', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
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

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.password.trim()) {
      setFormError('Name and password are required');
      return;
    }
    setSaving(true);
    try {
      const newUser = await usersAPI.create(form);
      setUsers(prev => [...prev, newUser]);
      setShowModal(false);
      setForm({ name: '', password: '', role: 'employee', email: '', phone: '' });
      toast.success(`User "${newUser.name}" created successfully`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(`User "${name}" removed`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardLayout role="owner" pageTitle="Team Management">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <p className="text-gray-500 mt-1">Add, view, and remove team members</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <span className="mr-2">+</span> Add Employee
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Members', value: users.length, icon: '👥' },
          { label: 'Owners',    value: users.filter(u => u.role === 'owner').length,    icon: '👑' },
          { label: 'Employees', value: users.filter(u => u.role === 'employee').length, icon: '👤' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className="text-3xl">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Role', 'Email', 'Phone', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700 text-sm">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          {u.id === currentUser?.id && <p className="text-xs text-gray-400">You</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      {u.id !== currentUser?.id ? (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deleting === u.id}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                        >
                          {deleting === u.id ? 'Removing...' : 'Remove'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-1">Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Username" required />
                </div>
                <div>
                  <label className="label block mb-1">Password *</label>
                  <input className="input" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="Min 4 chars" required />
                </div>
              </div>
              <div>
                <label className="label block mb-1">Role *</label>
                <select className="input" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
                  <option value="employee">Employee</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div>
                <label className="label block mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="name@example.com" />
              </div>
              <div>
                <label className="label block mb-1">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="9900000000" />
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
