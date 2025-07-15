// src/components/LocationPicker.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import iconPng from "leaflet/dist/images/marker-icon.png";
import shadowPng from "leaflet/dist/images/marker-shadow.png";

const icon = new L.Icon({
  iconUrl: iconPng,
  shadowUrl: shadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value);

  /* Ask browser for current location (once) */
  useEffect(() => {
    if (position) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(coords);
        onChange(coords);
      },
      () => console.log("Geolocation denied"),
      { enableHighAccuracy: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Map click handler */
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange(e.latlng); // 🔴 sends {lat,lng} upward
      },
    });
    return position ? <Marker position={position} icon={icon} /> : null;
  }

  return (
    <MapContainer
      center={position || { lat: -1.95, lng: 30.06 }} // Kigali as default
      zoom={13}
      className="h-64 w-full rounded-lg overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}
