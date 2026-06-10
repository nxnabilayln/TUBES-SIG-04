import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import SidePanel from "../components/SidePanel";
import { parkirAPI, wilayahAPI } from "../services/api";

export default function Home() {
  const [allParkir, setAllParkir] = useState([]);
  const [filteredParkir, setFilteredParkir] = useState([]);
  const [wilayah, setWilayah] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusM, setRadiusM] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data awal
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [resParkir, resWilayah] = await Promise.all([
          parkirAPI.getAll(),
          wilayahAPI.getAll(),
        ]);
        const features = resParkir.data.features || [];
        setAllParkir(features);
        setFilteredParkir(features);
        setWilayah(resWilayah.data);
      } catch (e) {
        setError("Gagal memuat data. Pastikan backend sudah berjalan.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Klik card di sidebar → fly ke marker di peta
  const handleCardClick = (parkir) => {
    setActiveId(parkir.id);
    setFlyTarget({ lat: parkir.latitude, lng: parkir.longitude });
  };

  // Klik marker di peta lalu akan muncul highlight card di sidebar
  const handleMarkerClick = (parkir) => {
    setActiveId(parkir.id);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Tombol toggle sidebar (mobile) */}
      <button
        onClick={() => setSidePanelOpen(!sidePanelOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-[960] bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-xl"
        aria-label="Toggle panel"
      >
        {sidePanelOpen ? "✕" : "🗂️"}
      </button>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel kiri */}
        <SidePanel
          allParkir={allParkir}
          filteredParkir={filteredParkir}
          setFilteredParkir={setFilteredParkir}
          onCardClick={handleCardClick}
          activeId={activeId}
          isOpen={sidePanelOpen}
          onClose={() => setSidePanelOpen(false)}
        />

        {/* Peta */}
        <main className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-[800] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  Memuat data parkir...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Menghubungi server...
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[800] bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl shadow text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          <MapView
            parkirFeatures={filteredParkir}
            flyTarget={flyTarget}
            userLocation={userLocation}
            radiusM={radiusM}
            onMarkerClick={handleMarkerClick}
            wilayahGeoJSON={wilayah}
          />
        </main>
      </div>
    </div>
  );
}
