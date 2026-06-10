import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ParkingPopup from "./ParkingPopup";

// Fix ikon default Leaflet yang hilang saat build Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// buat ikon custom per jenis kendaraan
const makeIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
    <div style="
      width:32px; height:38px; position:relative;
    ">
      <svg viewBox="0 0 32 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 22 16 22S32 28 32 16C32 7.16 24.84 0 16 0z"
          fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
      </svg>
    </div>`,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });

const ICONS = {
  mobil: makeIcon("#3B82F6"),
  motor: makeIcon("#22C55E"),
  umum: makeIcon("#F97316"),
};
const ICON_USER = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#EF4444;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(239,68,68,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// gerakkan peta ke koordinat tertentu
function FlyToMarker({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 17, { duration: 0.8 });
  }, [target, map]);
  return null;
}

// Koordinat pusat Bukittinggi
const CENTER_BUKITTINGGI = [-0.3062, 100.3691];

export default function MapView({
  parkirFeatures, // GeoJSON features array
  flyTarget, // { lat, lng } untuk flyTo
  userLocation, // { lat, lng } titik merah lokasi user
  radiusM, // radius lingkaran pencarian (meter)
  onMarkerClick, // callback saat marker diklik → set activeId
  wilayahGeoJSON, // GeoJSON polygon kecamatan
}) {
  const [popupData, setPopupData] = useState(null);
  const mapRef = useRef(null);

  // Style polygon kecamatan
  const kecamatanStyle = {
    color: "#0F6E56",
    weight: 2,
    opacity: 0.7,
    fillColor: "#0F6E56",
    fillOpacity: 0.06,
  };

  const onEachKecamatan = (feature, layer) => {
    const p = feature.properties;
    layer.bindTooltip(
      `<div class="text-xs font-semibold">${p.nama_kecamatan}<br/>
       <span class="font-normal text-gray-600">${p.jumlah_parkir || 0} parkir</span></div>`,
      { sticky: true, className: "leaflet-tooltip-custom" },
    );
  };

  const handleMarkerClick = (feature) => {
    const p = feature.properties;
    const lat = feature.geometry?.coordinates?.[1];
    const lng = feature.geometry?.coordinates?.[0];
    setPopupData({ ...p, latitude: lat, longitude: lng });
    if (onMarkerClick) onMarkerClick({ ...p, latitude: lat, longitude: lng });
  };

  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={CENTER_BUKITTINGGI}
        zoom={14}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={false}
      >
        {/* Tile layer OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          maxZoom={19}
        />

        {/* Polygon batas kecamatan */}
        {wilayahGeoJSON?.features?.length > 0 &&
          wilayahGeoJSON.features
            .filter((f) => f.geometry)
            .map((f) => (
              <GeoJSON
                key={f.properties.id}
                data={f}
                style={kecamatanStyle}
                onEachFeature={onEachKecamatan}
              />
            ))}

        {/* Marker tiap parkir */}
        {(parkirFeatures || []).map((feature) => {
          const [lng, lat] = feature.geometry?.coordinates || [];
          const p = feature.properties;
          if (!lat || !lng) return null;
          const icon = ICONS[p.jenis_kendaraan] || ICONS.umum;
          return (
            <Marker
              key={p.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{ click: () => handleMarkerClick(feature) }}
            >
              <Popup maxWidth={260} closeButton={false}>
                <ParkingPopup parkir={p} jarakMeter={p.jarak_meter} />
              </Popup>
            </Marker>
          );
        })}

        {/* Titik merah lokasi user */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={ICON_USER}
          >
            <Popup>
              <div className="text-xs font-medium p-1">📍 Lokasi Anda</div>
            </Popup>
          </Marker>
        )}

        {/* Lingkaran radius pencarian */}
        {userLocation && radiusM && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusM}
            pathOptions={{
              color: "#0F6E56",
              fillColor: "#0F6E56",
              fillOpacity: 0.08,
              weight: 1.5,
            }}
          />
        )}

        {/* FlyTo saat card diklik */}
        <FlyToMarker target={flyTarget} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 z-[800] text-xs">
        <p className="font-semibold text-gray-600 mb-1.5">Keterangan</p>
        {[
          { color: "#3B82F6", label: "Parkir Mobil" },
          { color: "#22C55E", label: "Parkir Motor" },
          { color: "#F97316", label: "Parkir Umum" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
