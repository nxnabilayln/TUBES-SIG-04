import { useState } from "react";
import ParkingCard from "./ParkingCard";
import { parkirAPI } from "../services/api";

export default function SidePanel({
  allParkir, // semua parkir dari API (GeoJSON features)
  filteredParkir, // hasil filter/pencarian saat ini
  setFilteredParkir, // update hasil ke Home
  onCardClick, // klik card → pindah peta ke marker itu
  activeId, // id parkir yang sedang aktif/diklik
  isOpen, // panel terbuka/tutup (mobile)
  onClose,
}) {
  const [jenis, setJenis] = useState("");
  const [tarifMax, setTarifMax] = useState(10000);
  const [radius, setRadius] = useState(500);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("semua"); // 'semua' | 'radius' | 'terdekat'
  const [userLoc, setUserLoc] = useState(null);
  const [locError, setLocError] = useState("");

  // Lokasi Saya
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Browser tidak mendukung geolocation");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject("Izin lokasi ditolak atau tidak tersedia"),
      );
    });

  const handleLokasiSaya = async () => {
    setLocError("");
    setLoading(true);
    try {
      const loc = await getLocation();
      setUserLoc(loc);
      const res = await parkirAPI.dalamRadius(
        loc.lat,
        loc.lng,
        radius,
        jenis || null,
      );
      const features = res.data.features || [];
      setFilteredParkir(features);
      setMode("radius");
    } catch (e) {
      setLocError(typeof e === "string" ? e : "Gagal mendapat lokasi");
    } finally {
      setLoading(false);
    }
  };

  // Filter jenis dan tarif
  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = {};
      if (jenis) params.jenis = jenis;
      if (tarifMax) params.tarif_max = tarifMax;
      const res = await parkirAPI.filter(params);
      setFilteredParkir(res.data.features || []);
      setMode("semua");
    } catch {
      // fallback filter lokal
      const hasil = allParkir.filter((f) => {
        const p = f.properties;
        if (jenis && p.jenis_kendaraan !== jenis) return false;
        if (tarifMax && p.tarif_per_jam > tarifMax) return false;
        return true;
      });
      setFilteredParkir(hasil);
      setMode("semua");
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setJenis("");
    setTarifMax(10000);
    setRadius(500);
    setUserLoc(null);
    setLocError("");
    setMode("semua");
    setFilteredParkir(allParkir);
  };

  const displayList = filteredParkir || allParkir || [];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[900] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
        fixed top-14 left-0 bottom-0 w-80 bg-gray-50 z-[950]
        flex flex-col shadow-xl transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:flex
      `}
      >
        {/* Header panel */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">Cari Parkir</h2>
            <p className="text-xs text-gray-400">
              {displayList.length} lokasi{" "}
              {mode === "radius" ? `dalam ${radius}m` : "ditemukan"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <span className="text-gray-500 text-lg">✕</span>
          </button>
        </div>

        {/* Filter section */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3 flex-shrink-0">
          {/* Jenis kendaraan */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Jenis Kendaraan
            </label>
            <div className="flex gap-1.5">
              {[
                { val: "", label: "Semua", icon: "🅿️" },
                { val: "mobil", label: "Mobil", icon: "🚗" },
                { val: "motor", label: "Motor", icon: "🏍️" },
                { val: "umum", label: "Umum", icon: "🔄" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setJenis(opt.val)}
                  className={`
                    flex-1 text-xs py-1.5 rounded-lg border transition-all font-medium
                    ${
                      jenis === opt.val
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/40"
                    }
                  `}
                >
                  {opt.icon}
                  <br />
                  <span className="text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tarif slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-gray-600">
                Tarif Maks
              </label>
              <span className="text-xs font-semibold text-primary">
                Rp {Number(tarifMax).toLocaleString("id-ID")}/jam
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={tarifMax}
              onChange={(e) => setTarifMax(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>Rp 1.000</span>
              <span>Rp 10.000</span>
            </div>
          </div>

          {/* Radius slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-gray-600">
                Radius Pencarian
              </label>
              <span className="text-xs font-semibold text-primary">
                {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>200 m</span>
              <span>3 km</span>
            </div>
          </div>

          {/* Error lokasi */}
          {locError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-2 py-1.5">
              ⚠️ {locError}
            </p>
          )}

          {/* Tombol aksi */}
          <div className="flex gap-2">
            <button
              onClick={handleLokasiSaya}
              disabled={loading}
              className="flex-1 bg-primary text-white text-xs py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {loading ? <span className="animate-spin">⏳</span> : "📍"} Lokasi
              Saya
            </button>
            <button
              onClick={handleFilter}
              disabled={loading}
              className="flex-1 bg-gray-800 text-white text-xs py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              🔍 Filter
            </button>
            <button
              onClick={handleReset}
              className="px-3 text-xs py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Reset filter"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Daftar hasil */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Mencari...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm text-gray-500 font-medium">
                Tidak ada hasil
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Coba ubah filter atau perbesar radius
              </p>
              <button
                onClick={handleReset}
                className="mt-3 text-xs text-primary underline"
              >
                Reset filter
              </button>
            </div>
          ) : (
            displayList.map((feature) => {
              const p = feature.properties || feature;
              const geo = feature.geometry;
              const lat = geo?.coordinates?.[1] ?? feature.latitude;
              const lng = geo?.coordinates?.[0] ?? feature.longitude;
              return (
                <ParkingCard
                  key={p.id}
                  parkir={p}
                  jarakMeter={p.jarak_meter}
                  isActive={activeId === p.id}
                  onClick={() =>
                    onCardClick({ ...p, latitude: lat, longitude: lng })
                  }
                />
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
