import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../context/AuthContext";
import { parkirAPI, wilayahAPI } from "../services/api";

// Fix ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// klik peta untuk ambil koordinat
function CoordPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

// Form Tambah/Edit
function ParkingForm({ editData, kecamatanList, onSave, onClose }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    nama: editData?.nama || "",
    alamat: editData?.alamat || "",
    jenis_kendaraan: editData?.jenis_kendaraan || "umum",
    kapasitas: editData?.kapasitas || "",
    tarif_per_jam: editData?.tarif_per_jam || "",
    jam_buka: editData?.jam_buka?.slice(0, 5) || "07:00",
    jam_tutup: editData?.jam_tutup?.slice(0, 5) || "21:00",
    kecamatan_id: editData?.kecamatan_id || "",
    latitude: editData?.latitude || "",
    longitude: editData?.longitude || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinPos, setPinPos] = useState(
    editData?.latitude
      ? { lat: editData.latitude, lng: editData.longitude }
      : null,
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleMapPick = (latlng) => {
    setPinPos(latlng);
    set("latitude", latlng.lat.toFixed(6));
    set("longitude", latlng.lng.toFixed(6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.nama ||
      !form.jenis_kendaraan ||
      !form.latitude ||
      !form.longitude
    ) {
      setError("Nama, jenis kendaraan, dan koordinat (klik peta) wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        kapasitas: form.kapasitas ? Number(form.kapasitas) : null,
        tarif_per_jam: form.tarif_per_jam ? Number(form.tarif_per_jam) : null,
        kecamatan_id: form.kecamatan_id ? Number(form.kecamatan_id) : null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        jam_buka: form.jam_buka ? form.jam_buka + ":00" : null,
        jam_tutup: form.jam_tutup ? form.jam_tutup + ":00" : null,
      };
      if (isEdit) {
        await parkirAPI.update(editData.id, payload);
      } else {
        await parkirAPI.create({ ...payload, fasilitas: [] });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-800">
            {isEdit ? "✏️ Edit Parkir" : "➕ Tambah Parkir Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl px-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Grid form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Nama Parkir *</label>
              <input
                className={inputCls}
                value={form.nama}
                onChange={(e) => set("nama", e.target.value)}
                placeholder="cth: Parkir Pasar Atas"
              />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Alamat</label>
              <input
                className={inputCls}
                value={form.alamat}
                onChange={(e) => set("alamat", e.target.value)}
                placeholder="Jl. ..."
              />
            </div>

            <div>
              <label className={labelCls}>Jenis Kendaraan *</label>
              <select
                className={inputCls}
                value={form.jenis_kendaraan}
                onChange={(e) => set("jenis_kendaraan", e.target.value)}
              >
                <option value="umum">🔄 Umum (mobil + motor)</option>
                <option value="mobil">🚗 Mobil</option>
                <option value="motor">🏍️ Motor</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Kecamatan</label>
              <select
                className={inputCls}
                value={form.kecamatan_id}
                onChange={(e) => set("kecamatan_id", e.target.value)}
              >
                <option value="">-- Pilih kecamatan --</option>
                {kecamatanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kecamatan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Kapasitas (kendaraan)</label>
              <input
                className={inputCls}
                type="number"
                min="1"
                value={form.kapasitas}
                onChange={(e) => set("kapasitas", e.target.value)}
                placeholder="cth: 100"
              />
            </div>

            <div>
              <label className={labelCls}>Tarif per Jam (Rp)</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="500"
                value={form.tarif_per_jam}
                onChange={(e) => set("tarif_per_jam", e.target.value)}
                placeholder="cth: 3000"
              />
            </div>

            <div>
              <label className={labelCls}>Jam Buka</label>
              <input
                className={inputCls}
                type="time"
                value={form.jam_buka}
                onChange={(e) => set("jam_buka", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Jam Tutup</label>
              <input
                className={inputCls}
                type="time"
                value={form.jam_tutup}
                onChange={(e) => set("jam_tutup", e.target.value)}
              />
            </div>
          </div>

          {/* Picker koordinat */}
          <div>
            <label className={labelCls}>
              Koordinat Lokasi * —{" "}
              <span className="text-primary font-normal">
                Klik peta untuk menentukan titik
              </span>
            </label>
            <div className="h-52 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
              <MapContainer
                center={pinPos ? [pinPos.lat, pinPos.lng] : [-0.3062, 100.3691]}
                zoom={14}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <CoordPicker onPick={handleMapPick} />
                {pinPos && <Marker position={[pinPos.lat, pinPos.lng]} />}
              </MapContainer>
            </div>
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Latitude</label>
                <input
                  className={inputCls + " mt-0.5"}
                  value={form.latitude}
                  readOnly
                  placeholder="Klik peta ↑"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Longitude</label>
                <input
                  className={inputCls + " mt-0.5"}
                  value={form.longitude}
                  readOnly
                  placeholder="Klik peta ↑"
                />
              </div>
            </div>
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                  Menyimpan...
                </>
              ) : isEdit ? (
                "💾 Simpan Perubahan"
              ) : (
                "✅ Tambah Parkir"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Halaman AdminPanel utama
export default function AdminPanel() {
  const { admin, logout } = useAuth();
  const [parkirs, setParkirs] = useState([]);
  const [kecamatans, setKecamatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJ, setFilterJ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConf, setDeleteConf] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resP, resW] = await Promise.all([
        parkirAPI.getAll(),
        wilayahAPI.getAll(),
      ]);
      const features = resP.data.features || [];
      setParkirs(
        features.map((f) => ({
          ...f.properties,
          latitude: f.geometry?.coordinates?.[1],
          longitude: f.geometry?.coordinates?.[0],
        })),
      );
      setKecamatans((resW.data.features || []).map((f) => f.properties));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id, nama) => {
    try {
      await parkirAPI.delete(id);
      showToast(`✅ "${nama}" berhasil dihapus ✅`);
      setDeleteConf(null);
      loadData();
    } catch {
      showToast("❌ Gagal menghapus data ❌");
    }
  };

  const handleSaved = () => {
    showToast(
      editData
        ? "✅ Data berhasil diupdate ✅"
        : "✅ Parkir baru berhasil ditambahkan ✅",
    );
    setShowForm(false);
    setEditData(null);
    loadData();
  };

  // Filter lokal
  const displayed = parkirs.filter((p) => {
    const matchSearch =
      !search ||
      p.nama?.toLowerCase().includes(search.toLowerCase()) ||
      p.alamat?.toLowerCase().includes(search.toLowerCase());
    const matchJenis = !filterJ || p.jenis_kendaraan === filterJ;
    return matchSearch && matchJenis;
  });

  const JENIS_BADGE = {
    mobil: "bg-blue-100 text-blue-700",
    motor: "bg-green-100 text-green-700",
    umum: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifikasi */}
      {toast && (
        <div className="fixed top-4 right-4 z-[2000] bg-gray-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Navbar admin */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <span className="text-xl">🅿️</span>
            <div>
              <p className="font-bold text-sm">Dashboard Admin</p>
              <p className="text-white/60 text-xs">WebGIS Parkir Bukittinggi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm hidden sm:block">
              👤 {admin?.nama_lengkap || admin?.username}
            </span>
            <Link
              to="/"
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              🗺️ Lihat Peta
            </Link>
            <button
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Parkir",
              val: parkirs.length,
              icon: "🅿️",
              color: "bg-primary/10 text-primary",
            },
            {
              label: "Parkir Mobil",
              val: parkirs.filter((p) => p.jenis_kendaraan === "mobil").length,
              icon: "🚗",
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Parkir Motor",
              val: parkirs.filter((p) => p.jenis_kendaraan === "motor").length,
              icon: "🏍️",
              color: "bg-green-50 text-green-700",
            },
            {
              label: "Total Kapasitas",
              val: parkirs
                .reduce((a, p) => a + (p.kapasitas || 0), 0)
                .toLocaleString("id-ID"),
              icon: "🚘",
              color: "bg-orange-50 text-orange-700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.color} rounded-2xl p-4 flex items-center gap-3`}
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold leading-none">{s.val}</p>
                <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari nama atau alamat..."
            className="flex-1 min-w-48 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <select
            value={filterJ}
            onChange={(e) => setFilterJ(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Semua jenis</option>
            <option value="mobil">🚗 Mobil</option>
            <option value="motor">🏍️ Motor</option>
            <option value="umum">🔄 Umum</option>
          </select>
          <button
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            ➕ Tambah Parkir
          </button>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Memuat data...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "ID",
                      "Nama",
                      "Jenis",
                      "Kapasitas",
                      "Tarif/Jam",
                      "Jam Operasi",
                      "Aksi",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayed.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-gray-400"
                      >
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm">Tidak ada data yang cocok</p>
                      </td>
                    </tr>
                  ) : (
                    displayed.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {p.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{p.nama}</p>
                          {p.alamat && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">
                              {p.alamat}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${JENIS_BADGE[p.jenis_kendaraan] || "bg-gray-100 text-gray-600"}`}
                          >
                            {p.jenis_kendaraan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {p.kapasitas ? `${p.kapasitas}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {p.tarif_per_jam
                            ? `Rp ${Number(p.tarif_per_jam).toLocaleString("id-ID")}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          {p.jam_buka && p.jam_tutup
                            ? `${p.jam_buka.slice(0, 5)} – ${p.jam_tutup.slice(0, 5)}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditData(p);
                                setShowForm(true);
                              }}
                              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => setDeleteConf(p)}
                              className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Footer tabel */}
          {!loading && displayed.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400">
              Menampilkan {displayed.length} dari {parkirs.length} data
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {showForm && (
        <ParkingForm
          editData={editData}
          kecamatanList={kecamatans}
          onSave={handleSaved}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConf && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h3 className="font-bold text-gray-800 text-center text-lg mb-2">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              Yakin ingin menghapus <strong>"{deleteConf.nama}"</strong>?<br />
              <span className="text-red-500 text-xs">
                Tindakan ini tidak bisa dibatalkan.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConf(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConf.id, deleteConf.nama)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
