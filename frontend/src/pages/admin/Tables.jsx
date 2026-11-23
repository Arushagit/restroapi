import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Table2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTables, createTable, updateTable, deleteTable } from '../../api/tables';
import { useToast } from '../../components/ui/Toast';

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4,
    status: 'available',
    location: ''
  });
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const loadTables = async () => {
    try {
      const res = await getTables();
      setTables(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurant tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const openCreateModal = () => {
    setEditingTable(null);
    setFormData({ table_number: `T${tables.length + 1}`, capacity: 4, status: 'available', location: 'Main Dining' });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTable(t);
    setFormData({ table_number: t.table_number, capacity: t.capacity, status: t.status, location: t.location || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTable) {
        await updateTable(editingTable.id, formData);
        toast.success(`Table ${formData.table_number} updated.`);
      } else {
        await createTable(formData);
        toast.success(`Table ${formData.table_number} added!`);
      }
      setIsModalOpen(false);
      loadTables();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save table. Table number must be unique.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete Table ${t.table_number}?`)) return;
    try {
      await deleteTable(t.id);
      toast.success(`Deleted Table ${t.table_number}`);
      loadTables();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete table.');
    }
  };

  const toggleStatus = async (t) => {
    const nextStatus = t.status === 'available' ? 'occupied' : 'available';
    try {
      await updateTable(t.id, { status: nextStatus });
      setTables(prev => prev.map(tbl => tbl.id === t.id ? { ...tbl, status: nextStatus } : tbl));
      toast.info(`Table ${t.table_number} marked as ${nextStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update table state.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-charcoal">Restaurant Tables & Seating</h2>
          <p className="text-xs text-gray-500">Monitor table occupancy, guest capacity, and dining zones</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-40 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
          No dining tables configured.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(t => {
            const isOccupied = t.status === 'occupied';
            const isReserved = t.status === 'reserved';

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  isOccupied ? 'border-orange-200 bg-orange-50/20' :
                  isReserved ? 'border-amber-200 bg-amber-50/20' :
                  'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      isOccupied ? 'bg-orange-100 text-orange-800' :
                      isReserved ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.table_number}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-charcoal">{t.location || 'Dining Area'}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Users size={12} /> {t.capacity} Seats
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isOccupied ? 'bg-orange-100 text-orange-700' :
                    isReserved ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => toggleStatus(t)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Set {isOccupied ? 'Available' : 'Occupied'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-charcoal">
                {editingTable ? 'Edit Table' : 'Add Dining Table'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Table Number *</label>
                <input
                  type="text"
                  required
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  placeholder="e.g. T7"
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Seating Capacity (Guests) *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Location Zone</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Garden Terrace, 1st Floor Window"
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md transition-all"
                >
                  {saving ? 'Saving...' : editingTable ? 'Update' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

