import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react'; // Import useMemo
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  Circle,
} from '@react-google-maps/api';
import { useParams } from 'react-router-dom';

const libraries = ['places'];
const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

// Map styling options (dark mode example - choose what fits your brand)
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];


const Success = () => {
  const { orderId } = useParams();
  const [driverPosition, setDriverPosition] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);
  const lat = localStorage.getItem('lat');
  const lon = localStorage.getItem('lon');
  const order = {
    deliveryStatus: 'On The Way',
    darkStoreLocation: { latitude: 28.7041, longitude: 77.1025 },
    shippingAddress: { latitude: lat, longitude: lon },
    driverInitialLocation: { latitude: 28.7000, longitude: 77.1000 },
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY,
    libraries,
  });

  // Define icons using useMemo, dependent on isLoaded
  const icons = useMemo(() => {
    if (!isLoaded) return {}; // Return empty object if maps API isn't loaded yet

    return {
      driver: {
        url: 'https://cdn-icons-png.flaticon.com/512/3502/3502606.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      },
      darkStore: {
        url: 'https://cdn-icons-png.flaticon.com/512/684/684809.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      },
      customer: {
        url: 'https://cdn-icons-png.flaticon.com/512/684/684852.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      },
    };
  }, [isLoaded]); // Only re-create icons when isLoaded changes

  useEffect(() => {
    if (order.deliveryStatus === 'On The Way' || order.deliveryStatus === 'Picked Up') {
      setDriverPosition(order.driverInitialLocation);
    } else {
      setDriverPosition(order.darkStoreLocation);
    }
  }, [order.deliveryStatus, order.darkStoreLocation, order.driverInitialLocation]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (driverPosition) {
      map.panTo({ lat: driverPosition.latitude, lng: driverPosition.longitude });
    }
  }, [driverPosition]);


  // Simulate driver's movement every few seconds
  useEffect(() => {
    // Only run if map is loaded and driver position is initialized
    if (!driverPosition || !isLoaded) return;

    const interval = setInterval(() => {
      setDriverPosition((prev) => {
        const destinationLat = order.shippingAddress.latitude;
        const destinationLng = order.shippingAddress.longitude;

        const deltaLat = (destinationLat - prev.latitude) * 0.00005;
        const deltaLng = (destinationLng - prev.longitude) * 0.00005;

        const randomLat = (Math.random() - 0.5) * 0.00001;
        const randomLng = (Math.random() - 0.5) * 0.00001;

        const newLat = prev.latitude + deltaLat + randomLat;
        const newLng = prev.longitude + deltaLng + randomLng;

        return { latitude: newLat, longitude: newLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [driverPosition, isLoaded, order.shippingAddress]);

  // Calculate and update route/ETA
  useEffect(() => {
    if (!isLoaded || !driverPosition || !order.shippingAddress || !window.google) return;

    const origin = { lat: driverPosition.latitude, lng: driverPosition.longitude };
    const destination = {
      lat: order.shippingAddress.latitude,
      lng: order.shippingAddress.longitude,
    };

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          const route = result.routes[0];
          if (route && route.legs && route.legs.length > 0) {
            const duration = route.legs[0].duration.text;
            setEta(duration);
          }
        } else {
          console.error('Directions request failed due to', status);
          setDirectionsResponse(null);
          setEta(null);
        }
      }
    );
  }, [driverPosition, isLoaded, order.shippingAddress]);

  if (loadError) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>❌ Failed to load Google Maps. Please check your API key and internet connection.</div>;
  if (!isLoaded || !driverPosition || !icons.driver) {
    // Also wait for icons to be ready
    return <div style={{ textAlign: 'center', padding: '20px' }}>⏳ Loading map and order details...</div>;
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '20px auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '25px',
        fontSize: '2.5em'
      }}>
        📦 Your Order is on its Way!
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#555',
        fontSize: '1.2em',
        marginBottom: '30px'
      }}>
        Order ID: <strong style={{ color: '#007bff' }}>#{orderId}</strong>
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#e9ecef',
        padding: '15px 25px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0', color: '#6c757d', fontSize: '0.9em' }}>Delivery Status</p>
          <p style={{ margin: '5px 0 0', fontWeight: 'bold', color: '#28a745', fontSize: '1.1em' }}>
            {order.deliveryStatus}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0', color: '#6c757d', fontSize: '0.9em' }}>Estimated Arrival</p>
          <p style={{ margin: '5px 0 0', fontWeight: 'bold', color: '#007bff', fontSize: '1.1em' }}>
            {eta ? eta : 'Calculating...'}
          </p>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: driverPosition.latitude, lng: driverPosition.longitude }}
        zoom={12}
        onLoad={onMapLoad}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          scrollwheel: true,
          gestureHandling: 'cooperative',
        }}
      >
        {/* Dark Store Marker */}
        <MarkerF
          position={{
            lat: order.darkStoreLocation.latitude,
            lng: order.darkStoreLocation.longitude,
          }}
          icon={icons.darkStore} // Use icons from the useMemo hook
          title="Dark Store"
        />

        {/* Customer Marker */}
        <MarkerF
          position={{
            lat: order.shippingAddress.latitude,
            lng: order.shippingAddress.longitude,
          }}
          icon={icons.customer} // Use icons from the useMemo hook
          title="Your Delivery Address"
        />

        {/* Driver Marker */}
        <MarkerF
          position={{
            lat: driverPosition.latitude,
            lng: driverPosition.longitude,
          }}
          icon={icons.driver} // Use icons from the useMemo hook
          title="Driver"
        />

        {/* Route */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#007bff',
                strokeOpacity: 0.9,
                strokeWeight: 6,
              },
            }}
          />
        )}

        {/* Geofence around customer */}
        <Circle
          center={{
            lat: order.shippingAddress.latitude,
            lng: order.shippingAddress.longitude,
          }}
          radius={200}
          options={{
            strokeColor: '#dc3545',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#dc3545',
            fillOpacity: 0.15,
            draggable: false,
            editable: false,
            visible: true,
            zIndex: 1,
          }}
        />
      </GoogleMap>

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <p style={{ margin: '0', color: '#495057' }}>
          We'll notify you when your driver is very close!
        </p>
      </div>
    </div>
  );
};

export default Success;