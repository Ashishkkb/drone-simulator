import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { LngLatBounds, Map as MapboxMap } from 'mapbox-gl';

interface MapProps {
  path: [number, number][];
  accessToken: string;
  dronePosition: [number, number] | null;
  isDroneMoving: boolean;
}

const Map: React.FC<MapProps> = ({ path, accessToken, dronePosition, isDroneMoving }) => {
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

      const bounds = new LngLatBounds();

      if (path.length > 0) {
        path.forEach(([longitude, latitude]) => {
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

  useEffect(() => {
    if (dronePosition && mapRef.current) {
      const [longitude, latitude] = dronePosition;
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 10 });
    }
  }, [dronePosition]);

  useEffect(() => {
    if (isDroneMoving) {
      startDroneMovement();
    }
  }, [isDroneMoving]);

  const startDroneMovement = () => {
    let index = 0;

    const moveDrone = () => {
      if (index < path.length - 1) {
        const [longitude, latitude] = path[index];
        mapRef.current!.flyTo({ center: [longitude, latitude], zoom: 10 });
        index++;
        setTimeout(moveDrone, 1000); // Adjust the interval as needed (1 second delay between movements)
      }
    };

    moveDrone();
  };

  return <div ref={mapContainerRef} className="map-container max-w-screen max-h-screen w-screen h-screen rounded-lg shadow-md" />;
};

export default Map;
