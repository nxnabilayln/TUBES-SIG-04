const JENIS_COLOR = {
  mobil: "bg-blue-100 text-blue-700",
  motor: "bg-green-100 text-green-700",
  umum: "bg-orange-100 text-orange-700",
};

const JENIS_ICON = { mobil: "🚗", motor: "🏍️", umum: "🅿️" };

function InfoRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 text-xs text-gray-600">
      <span className="w-4 text-center flex-shrink-0">{icon}</span>
      <div>
        <span className="text-gray-400">{label}: </span>
        <span className="font-medium text-gray-700">{value}</span>
      </div>
    </div>
  );
}

export default function ParkingPopup({ parkir, jarakMeter }) {
  console.log("PARKIR DATA =", parkir);

  if (!parkir) return null;

  const {
    nama,
    alamat,
    jenis_kendaraan,
    kapasitas,
    tarif_per_jam,
    jam_buka,
    jam_tutup,
    fasilitas = [],
  } = parkir;

  const formatJam = (t) => (t ? t.slice(0, 5) : null);
  const formatTarif = (t) =>
    t ? `Rp ${Number(t).toLocaleString("id-ID")}/jam` : null;
  const formatJarak = (m) => {
    if (!m && m !== 0) return null;
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  };

  const jamBuka = formatJam(jam_buka);
  const jamTutup = formatJam(jam_tutup);
  const jamOps = jamBuka && jamTutup ? `${jamBuka} – ${jamTutup}` : null;

  return (
    <div className="w-60">
      {/* Header */}
      <div className="bg-primary p-3 text-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{nama}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${JENIS_COLOR[jenis_kendaraan] || "bg-gray-100 text-gray-600"}`}
          >
            {JENIS_ICON[jenis_kendaraan]} {jenis_kendaraan}
          </span>
        </div>
        {jarakMeter !== undefined && (
          <p className="text-white/70 text-xs mt-1">
            📍 {formatJarak(jarakMeter)} dari lokasi Anda
          </p>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-1.5 bg-white">
        {alamat && <InfoRow icon="📌" label="Alamat" value={alamat} />}
        {kapasitas && (
          <InfoRow
            icon="🚘"
            label="Kapasitas"
            value={`${kapasitas} kendaraan`}
          />
        )}
        {tarif_per_jam && (
          <InfoRow icon="💰" label="Tarif" value={formatTarif(tarif_per_jam)} />
        )}
        {jamOps && <InfoRow icon="🕐" label="Jam buka" value={jamOps} />}

        {/* Fasilitas */}
        {fasilitas.length > 0 && (
          <div className="pt-1.5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5">Fasilitas:</p>
            <div className="flex flex-wrap gap-1">
              {fasilitas
                .filter((f) => f.status_aktif)
                .map((f) => (
                  <span
                    key={f.id}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md"
                  >
                    {f.nama_fasilitas}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
