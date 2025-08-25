import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Custom component to fit the map bounds to all markers
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    // Filter out null locations before creating bounds
    const validLocations = locations.filter(loc => loc);
    if (validLocations.length === 0) return;

    const bounds = L.latLngBounds(validLocations.map(loc => [loc.latitude, loc.longitude]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [locations, map]);

  return null;
};

// Custom icon factory with improved visuals and text labels
const getIcon = (type) => {
  const iconConfig = {
    customer: {
      url: "https://cdn-icons-png.flaticon.com/512/3673/3673238.png", // Example customer icon
      text: "Customer",
    },
    store: {
      url: "https://cdn-icons-png.flaticon.com/512/10043/10043868.png", // Example store icon
      text: "Store",
    },
    driver: {
      url: "https://cdn-icons-png.flaticon.com/512/3858/3858632.png", // Example driver icon
      text: "Driver",
    },
  }[type];

  if (!iconConfig) return null;

  return divIcon({
    html: `
      <div style="text-align: center; font-weight: bold;">
        <img src="${iconConfig.url}" style="width: 40px; height: 40px;"/>
        <div style="font-size: 10px; margin-top: -10px;">${iconConfig.text}</div>
      </div>
    `,
    iconSize: [40, 40],
    className: "", // Prevents default Leaflet styling
  });
};

// Routing component (store -> customer)
const Routing = ({ storeLocation, customerLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!storeLocation || !customerLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(storeLocation.latitude, storeLocation.longitude),
        L.latLng(customerLocation.latitude, customerLocation.longitude),
      ],
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      showAlternatives: false, // Set to false to hide alternative routes
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, storeLocation, customerLocation]);

  return null;
};

const TrackOrder = () => {
  const { orderId } = useParams();

  const [deliveryStatus, setDeliveryStatus] = useState("Pending");
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [locations, setLocations] = useState({
    store: null,
    driver: null,
    customer: null,
  });

  const fetchOrderTrackingDetails = useCallback(async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getOrderTrackingDetailsUsingOrderId,
        data: { orderId },
      });

      if (response.data.success && response.data.data) {
        const { order, fleet_location } = response.data.data;

        setDeliveryStatus(order?.deliveryStatus || "Pending");
        setEstimatedDelivery(order?.estimatedDelivery || null);

        // Update the single locations state object
        setLocations({
          store: { latitude: 28.6256, longitude: 77.3824 },
          customer: { latitude: 28.62594, longitude: 77.459704 },
          driver: Array.isArray(fleet_location) ? fleet_location[0] : fleet_location,
        });
      }
    } catch (err) {
      AxiosToastError(err);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderTrackingDetails();
    // Refresh tracking details every 10 seconds
    const interval = setInterval(fetchOrderTrackingDetails, 10000);
    return () => clearInterval(interval);
  }, [fetchOrderTrackingDetails]);

  // Use memo to create a list of valid markers for the map
  const activeMarkers = useMemo(() => {
    return Object.entries(locations)
      .filter(([, location]) => location !== null)
      .map(([type, location]) => ({ type, location }));
  }, [locations]);

  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const initialCenter = activeMarkers.length > 0 ? [activeMarkers[0].location.latitude, activeMarkers[0].location.longitude] : defaultCenter;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Track Your Order 🗺️</h2>

      <div className="space-y-2 mb-6 text-center">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Status:</strong> {deliveryStatus}</p>
        <p><strong>Estimated Delivery:</strong> {estimatedDelivery || "Calculating..."}</p>
      </div>

      {activeMarkers.length > 0 && (
        <div className="mt-6 h-96">
          <MapContainer
            center={initialCenter}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render all active markers dynamically */}
            {activeMarkers.map(({ type, location }) => (
              <Marker
                key={type}
                position={[location.latitude, location.longitude]}
                icon={getIcon(type)}
              >
                <Popup>{type.charAt(0).toUpperCase() + type.slice(1)} Location</Popup>
              </Marker>
            ))}

            {/* Automatically fit the map to show all markers */}
            <FitBounds locations={Object.values(locations)} />

            {/* Driving Route from Store to Customer */}
            {locations.store && locations.customer && (
              <Routing
                storeLocation={locations.store}
                customerLocation={locations.customer}
              />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;