const JENIS_STYLE = {
  mobil: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: "🚗",
  },
  motor: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
    icon: "🏍️",
  },
  umum: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-400",
    icon: "🅿️",
  },
};

export default function ParkingCard({ parkir, jarakMeter, onClick, isActive }) {
  const {
    nama,
    alamat,
    jenis_kendaraan,
    kapasitas,
    tarif_per_jam,
    jam_buka,
    jam_tutup,
  } = parkir;

  const style = JENIS_STYLE[jenis_kendaraan] || JENIS_STYLE.umum;

  const formatTarif = (t) =>
    t ? `Rp ${Number(t).toLocaleString("id-ID")}` : "-";
  const formatJarak = (m) => {
    if (m == null) return null;
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  };
  const formatJam = (t) => (t ? t.slice(0, 5) : null);

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl border p-3 transition-all duration-150 mb-2
        ${
          isActive
            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
            : "border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start gap-2.5">
        {/* Dot warna jenis */}
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${style.dot}`}
        />

        <div className="flex-1 min-w-0">
          {/* Nama + badge jenis */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-800 leading-tight truncate">
              {nama}
            </h4>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${style.bg} ${style.text} border ${style.border}`}
            >
              {style.icon} {jenis_kendaraan}
            </span>
          </div>

          {/* Alamat */}
          {alamat && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{alamat}</p>
          )}

          {/* Info baris bawah */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {tarif_per_jam != null && (
              <span className="text-xs font-medium text-primary">
                💰 {formatTarif(tarif_per_jam)}/jam
              </span>
            )}
            {kapasitas && (
              <span className="text-xs text-gray-500">🚘 {kapasitas} slot</span>
            )}
            {jam_buka && jam_tutup && (
              <span className="text-xs text-gray-500">
                🕐 {formatJam(jam_buka)}–{formatJam(jam_tutup)}
              </span>
            )}
          </div>

          {/* Jarak (kalau ada dari hasil pencarian) */}
          {jarakMeter != null && (
            <div className="mt-1.5">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                📍 {formatJarak(jarakMeter)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
