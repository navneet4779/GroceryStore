import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";

// Define the libraries you need. 'geometry' is required for advanced calculations.
const libraries = ["places", "geometry"];

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Custom marker icons
const icons = {
  customer: {
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    text: "Customer",
  },
  store: {
    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    text: "Store",
  },
  driver: {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    text: "Driver",
  },
};

const TrackOrder = () => {
  const { orderId } = useParams();
  

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [deliveryStatus, setDeliveryStatus] = useState("Pending");
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [locations, setLocations] = useState({
    store: null,
    driver: null,
    customer: null,
  });
  const [directions, setDirections] = useState(null); // State to store the route polyline path

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

        setLocations({
          store: { lat: 28.6256, lng: 77.3824 },
          customer: { lat: 28.62594, lng: 77.459704 },
          driver: Array.isArray(fleet_location) ? fleet_location[0] : fleet_location,
        });
      }
    } catch (err) {
      AxiosToastError(err);
    }
  }, [orderId]);

  // Fetch directions and update state
  const fetchDirections = useCallback(() => {
    if (!isLoaded || !locations.store || !locations.customer) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: locations.store,
        destination: locations.customer,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Extract the polyline path from the result
          setDirections(result.routes[0].overview_path);
        } else {
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );
  }, [isLoaded, locations.store, locations.customer]);

  useEffect(() => {
    fetchOrderTrackingDetails();
    const interval = setInterval(fetchOrderTrackingDetails, 10000);
    return () => clearInterval(interval);
  }, [fetchOrderTrackingDetails]);

  // Fetch directions whenever locations change
  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  // Use memo to create a list of valid marker positions for map bounds
  const activePositions = useMemo(() => {
    return Object.values(locations).filter(pos => pos !== null);
  }, [locations]);

  // Center the map to include all markers
  const onMapLoad = useCallback((map) => {
    if (activePositions.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      activePositions.forEach((pos) => bounds.extend(pos));
      map.fitBounds(bounds);
    }
  }, [activePositions]);

  if (loadError) {
    return <div>Error loading Google Maps. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Track Your Order 🗺️</h2>

      <div className="space-y-2 mb-6 text-center">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Status:</strong> {deliveryStatus}</p>
        <p><strong>Estimated Delivery:</strong> {estimatedDelivery || "Calculating..."}</p>
      </div>

      <div className="mt-6 h-96">
        <GoogleMap
          mapContainerStyle={containerStyle}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true, // Hides UI controls for a cleaner look
            zoomControl: true,
            fullscreenControl: true,
          }}
        >
          {Object.entries(locations).map(([type, location]) =>
            location ? (
              <Marker
                key={type}
                position={location}
                icon={{
                  url: icons[type].url,
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                label={{
                  text: icons[type].text,
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              />
            ) : null
          )}

          {/* Render the route polyline */}
          {directions && (
            <Polyline
              path={directions}
              options={{
                strokeColor: "#2196f3",
                strokeOpacity: 0.8,
                strokeWeight: 6,
                geodesic: true,
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default TrackOrder;