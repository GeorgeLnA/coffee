import React, { useEffect, useRef, useState } from "react";

export type TradePoint = {
  name: string;
  address: string;
  hours: string;
  active: boolean;
  lat: number;
  lng: number;
};

interface GoogleMapsMapProps {
  tradePoints: TradePoint[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapsMap: React.FC<GoogleMapsMapProps> = ({
  tradePoints,
  selectedIndex,
  onSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found. Map will not be displayed.');
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const center = {
      lat: tradePoints[selectedIndex].lat,
      lng: tradePoints[selectedIndex].lng,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 16,
      center: center,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      // Using default Google Maps light theme - no custom styles
    });

    // Create markers for all trade points
    markersRef.current = tradePoints.map((point, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: mapInstanceRef.current,
        title: point.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${point.active ? '#10b981' : '#6b7280'}" stroke="#fcf4e4" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
      });

      // Add click listener to marker
      marker.addListener("click", () => {
        onSelect(index);
      });

      // Create info window
      const query = encodeURIComponent(`${point.name} ${point.address}`.trim());
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #361c0c; font-weight: bold;">${point.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${point.address}</p>
            <p style="margin: 0; color: #666; font-size: 12px;">${point.hours}</p>
            <p style="margin: 4px 0 0 0; color: ${point.active ? '#10b981' : '#6b7280'}; font-size: 12px; font-weight: bold;">
              ${point.active ? 'Відкрито' : 'Закрито'}
            </p>
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #361c0c; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold;">
              Відкрити в Google Maps
            </a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close all other info windows
        markersRef.current.forEach((m) => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        // Open this marker's info window
        infoWindow.open(mapInstanceRef.current, marker);
        onSelect(index);
      });

      // Store info window reference
      marker.infoWindow = infoWindow;

      return marker;
    });

    setIsLoaded(true);
  };

  // Pan to selected trade point
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded && tradePoints[selectedIndex]) {
      const targetPosition = {
        lat: tradePoints[selectedIndex].lat,
        lng: tradePoints[selectedIndex].lng,
      };

      mapInstanceRef.current.panTo(targetPosition);
      
      // Open info window for selected marker
      if (markersRef.current[selectedIndex]) {
        markersRef.current[selectedIndex].infoWindow.open(
          mapInstanceRef.current,
          markersRef.current[selectedIndex]
        );
      }
    }
  }, [selectedIndex, isLoaded, tradePoints]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative w-full h-full">
      {!apiKey ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Карта недоступна</p>
            <p className="text-gray-500 text-sm mt-2">API ключ не налаштовано</p>
          </div>
        </div>
      ) : !isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Завантаження карти...</p>
          </div>
        </div>
      ) : null}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMapsMap;
