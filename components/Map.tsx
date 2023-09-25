// components/Map.tsx

import React, { useRef, useEffect } from 'react';
import mapboxgl, { LngLatBounds, Map as MapboxMap } from 'mapbox-gl';

interface MapProps {
  path: [number, number][];
  accessToken: string;
}

const Map: React.FC<MapProps> = ({ path, accessToken }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 1,
    });

    // Initialize a GeoJSON object for the drone path
    const geojson: mapboxgl.GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: path, // Use the path data directly
        },
        properties: {}, // Add an empty properties object
      },
    };

    mapRef.current.on('load', () => {
      // Check if the source with ID 'drone-path' already exists
      if (!mapRef.current!.getSource('drone-path')) {
        mapRef.current!.addSource('drone-path', geojson);
      }

      mapRef.current!.addLayer({
        id: 'drone-path',
        type: 'line',
        source: 'drone-path',
        paint: {
          'line-color': '#007CBF',
          'line-width': 2,
        },
      });

      // Calculate the bounding box
      const bounds = new LngLatBounds();

      if (path.length > 0) {
        path.forEach(([longitude, latitude]) => {
          // Debug logging to identify invalid data
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

          // Check if latitude and longitude are valid numbers
          if (!isNaN(latitude) && !isNaN(longitude)) {
            bounds.extend([longitude, latitude]);
          }
        });
      }

      if (mapRef.current?.loaded() && !bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [path, accessToken]);

  // Update the map when the path data changes
  useEffect(() => {
    if (mapRef.current) {
      // Update the source data
      (mapRef.current.getSource('drone-path') as any)?.setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: path,
        },
        properties: {},
      });
    }
  }, [path]);

  return <div ref={mapContainerRef} className="map-container h-[600px] rounded-lg shadow-md mb-8" />;
};

export default Map;
