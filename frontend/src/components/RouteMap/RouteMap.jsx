// RouteMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { startIcon, pickupIcon, endIcon, fuelStopIcon } from "./icons";

const RouteMap = ({ tripData }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!tripData) return;

    console.log('========================');
    console.log('WAYPOINTS DATA');
    console.log('========================');
    console.table(tripData.route.waypoints);

    tripData.route.waypoints.forEach((wp, i) => {
      console.log(`Waypoint ${i}`);
      console.log('Name:', wp.name);
      console.log('Coordinates:', wp.coordinates);
    });

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795], // default US center
      zoom: 4,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const { waypoints, fuel_stops } = tripData.route;

    // Add Start / Pickup / End markers
    if (waypoints && waypoints.length) {
      waypoints.forEach((wp, idx) => {
        let color = "blue";
        let label = "Pickup";

        if (idx === 0) {
          color = "green";
          label = "Start";
        } else if (idx === waypoints.length - 1) {
          color = "red";
          label = "End";
        }

        const [lon, lat] = wp.coordinates; // swap if needed

        console.log("Adding waypoint marker", {
          label,
          lat,
          lon,
          name: wp.name,
        });

        // Use circleMarker for verification
        L.circleMarker([lat, lon], {
          radius: 10,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        })
          .addTo(map)
          .bindPopup(`<b>${label}</b><br/>${wp.name}`);
      });
    }

    // Add fuel stops
    if (fuel_stops && fuel_stops.length) {
      fuel_stops.forEach((stop, idx) => {
        const [lon, lat] = stop.coordinates; // swap if necessary
        console.log("Fuel stop marker", { idx, lat, lon });
        L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: "orange",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        })
          .addTo(map)
          .bindPopup(`Fuel Stop ${idx + 1}`);
      });
    }

    // Fit map to all markers
    const allCoords = [
      ...waypoints.map((wp) => wp.coordinates),
      ...fuel_stops.map((stop) => stop.coordinates),
    ];
    if (allCoords.length) {
      const bounds = L.latLngBounds(allCoords.map(([lon, lat]) => [lat, lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => map.remove();
  }, [tripData]);

  return <div ref={mapRef} style={{ height: "500px", width: "100%" }} />;
};

export default RouteMap;