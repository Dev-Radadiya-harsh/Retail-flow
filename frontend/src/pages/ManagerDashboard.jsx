import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { shopsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

// ─── Sub-component: Shop Card ─────────────────────────────────────────────────
function ShopCard({ shop, onSelect, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="card p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xl">🏪</div>
          <div>
            <h3 className="font-bold text-gray-900">{shop.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Created {new Date(shop.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            if (!window.confirm(`Delete "${shop.name}"? This will also remove all its owners, employees, products, and sales.`)) return;
            setDeleting(true);
            await onDelete(shop.id, shop.name);
            setDeleting(false);
          }}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-lg transition-all disabled:opacity-40"
          title="Delete shop"
        >🗑️</button>
      </div>

      <div className="flex gap-3 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1"><span>👑</span>{shop.ownerCount ?? 0} owner{shop.ownerCount !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1"><span>👤</span>{shop.employeeCount ?? 0} employee{shop.employeeCount !== 1 ? 's' : ''}</span>
      </div>

      <button
        onClick={() => onSelect(shop)}
        className="btn btn-primary w-full py-2 text-sm"
      >
        Manage Shop →
      </button>
    </div>
  );
}

// ─── Sub-component: Manage Shop View ─────────────────────────────────────────
function ManageShopView({ shop, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await shopsAPI.getUsers(shop.id);
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [shop.id, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAddOwner = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.password.trim()) { setFormError('Name and password are required'); return; }
    setSaving(true);
    try {
      const created = await shopsAPI.addOwner(shop.id, form);
      setUsers(prev => [...prev, created]);
      setShowOwnerForm(false);
      setForm({ name: '', password: '', email: '', phone: '' });
      toast.success(`Owner "${created.name}" added to ${shop.name}`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const owners = users.filter(u => u.role === 'owner');
  const employees = users.filter(u => u.role === 'employee');

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium mb-6">
        ← Back to all shops
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl">🏪</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{shop.name}</h2>
          <p className="text-gray-400 text-sm">Manage owners and view staff</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div><p className="text-xl font-bold text-purple-700">{owners.length}</p><p className="text-xs text-gray-500">Owners</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <div><p className="text-xl font-bold text-blue-700">{employees.length}</p><p className="text-xs text-gray-500">Employees</p></div>
        </div>
      </div>

      {/* Owners */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">👑 Owners</h3>
          <button onClick={() => setShowOwnerForm(true)} className="btn btn-primary py-1.5 px-4 text-sm">+ Add Owner</button>
        </div>
        {loading ? <p className="p-6 text-gray-400 text-sm">Loading...</p> : (
          <div className="divide-y divide-gray-100">
            {owners.length === 0 ? (
              <p className="p-6 text-gray-400 text-sm text-center">No owners yet. Add one above.</p>
            ) : owners.map(u => (
              <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email || 'No email'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employees (view only for manager) */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">👤 Employees <span className="text-xs text-gray-400 font-normal ml-2">(managed by the shop owner)</span></h3>
        </div>
        {loading ? <p className="p-6 text-gray-400 text-sm">Loading...</p> : (
          <div className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <p className="p-6 text-gray-400 text-sm text-center">No employees yet. The shop owner adds employees.</p>
            ) : employees.map(u => (
              <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email || 'No email'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Owner Modal */}
      {showOwnerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold">Add Owner to {shop.name}</h3>
              <button onClick={() => { setShowOwnerForm(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddOwner} className="p-5 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                Use the <strong>same email</strong> they will use to sign in on the login page (stored in RetailFlow&apos;s database).
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label block mb-1">Username *</label><input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. rahul" required /></div>
                <div><label className="label block mb-1">Password *</label><input className="input" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="Min 4 chars" required /></div>
              </div>
              <div><label className="label block mb-1">Email <span className="text-red-500">(login email)</span></label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="owner@shop.com" /></div>
              <div><label className="label block mb-1">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="Optional" /></div>
              {formError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowOwnerForm(false); setFormError(''); }} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>{saving ? 'Adding...' : 'Add Owner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main: Manager Dashboard ──────────────────────────────────────────────────
const ManagerDashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showNewShop, setShowNewShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const toast = useToast();

  const fetchShops = useCallback(async () => {
    try {
      const data = await shopsAPI.getAll();
      setShops(data);
    } catch (err) {
      toast.error('Failed to load shops: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newShopName.trim()) { setCreateError('Shop name is required'); return; }
    setCreating(true);
    try {
      const shop = await shopsAPI.create(newShopName.trim());
      setShops(prev => [shop, ...prev]);
      setNewShopName('');
      setShowNewShop(false);
      toast.success(`Shop "${shop.name}" created!`);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteShop = async (id, name) => {
    try {
      await shopsAPI.delete(id);
      setShops(prev => prev.filter(s => s.id !== id));
      if (selectedShop?.id === id) setSelectedShop(null);
      toast.success(`Shop "${name}" deleted`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout role="manager" pageTitle="Manager Dashboard">
      {selectedShop ? (
        <ManageShopView shop={selectedShop} onBack={() => setSelectedShop(null)} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Shops</h2>
              <p className="text-gray-500 mt-1">Select a shop to manage its owners and staff</p>
            </div>
            <button onClick={() => setShowNewShop(true)} className="btn btn-primary">
              + New Shop
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading shops...</div>
          ) : shops.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🏪</p>
              <p className="text-lg font-semibold text-gray-700">No shops yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">Create your first shop to get started</p>
              <button onClick={() => setShowNewShop(true)} className="btn btn-primary mx-auto">+ Create Shop</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shops.map(shop => (
                <ShopCard key={shop.id} shop={shop} onSelect={setSelectedShop} onDelete={handleDeleteShop} />
              ))}
            </div>
          )}

          {/* New Shop Modal */}
          {showNewShop && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold">Create New Shop</h3>
                  <button onClick={() => { setShowNewShop(false); setCreateError(''); setNewShopName(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleCreate} className="p-5 space-y-4">
                  <div>
                    <label className="label block mb-1">Shop Name *</label>
                    <input className="input" value={newShopName} onChange={e => setNewShopName(e.target.value)} placeholder="e.g. MG Road Branch" autoFocus required />
                  </div>
                  {createError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{createError}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setShowNewShop(false); setCreateError(''); setNewShopName(''); }} className="btn btn-outline flex-1">Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={creating}>{creating ? 'Creating...' : 'Create Shop'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
