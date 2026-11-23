export default function StatCard({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-orange-50' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-charcoal">{value ?? '—'}</p>
      </div>
    </div>
  );
}
