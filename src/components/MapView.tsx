import { useEffect, useRef, useState, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, ZoomIn, ZoomOut, Locate, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

interface Property {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: string;
  trustScore: number;
  price: number;
}

interface MapViewProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  center?: { lat: number; lng: number };
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBElBNiFjwNPe7crCoJ_5e6ZL8YU-26oC4";

const MapView = ({ properties, onPropertySelect, center }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const markersRef = useRef<any[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current!, {
        center: center || { lat: 39.8283, lng: -98.5795 },
        zoom: 5,
        mapTypeId: mapType,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        keyboardShortcuts: false,
        clickableIcons: false,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0a1929" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8b92a8" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0a1929" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#003d5c" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
        ],
      });

      setMapInstance(map);
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,visualization`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [center, mapInstance, mapType]);

  // Update map type without re-init
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapTypeId(mapType);
    }
  }, [mapInstance, mapType]);

  // Update center gracefully
  useEffect(() => {
    if (mapInstance && center) {
      mapInstance.setCenter(center);
    }
  }, [mapInstance, center]);

  // Update markers when properties change, without re-creating the map
  useEffect(() => {
    if (!mapInstance) return;
    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    // Add new markers
    properties.forEach(property => {
      const marker = new window.google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: mapInstance,
        title: property.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getStatusColor(property.status),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      marker.addListener('click', () => {
        setSelectedProperty(property);
        onPropertySelect?.(property);
      });
      markersRef.current.push(marker);
    });
  }, [mapInstance, properties, onPropertySelect]);

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'for-sale': '#3b82f6',
      'off-market': '#06b6d4',
      'trending': '#eab308',
      'flagged': '#ef4444',
    };
    return colors[status] || '#3b82f6';
  };

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom() - 1);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (mapInstance) {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance.setCenter(pos);
          mapInstance.setZoom(12);
        }
      });
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
    toast.info(`Heatmap ${!showHeatmap ? 'enabled' : 'disabled'}`);
  };

  const setMapTypeRoadmap = () => {
    setMapType('roadmap');
    if (mapInstance) mapInstance.setMapTypeId('roadmap');
  };

  const setMapTypeSatellite = () => {
    setMapType('satellite');
    if (mapInstance) mapInstance.setMapTypeId('satellite');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(v => !v);
    // Trigger a resize event so Google Maps recalculates layout
    setTimeout(() => {
      if (mapInstance) {
        window.google.maps.event.trigger(mapInstance, "resize");
      }
    }, 200);
  };

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <style>{`
        /* Hide Google bottom-right overlays and default map type controls */
        .gm-style-cc, .gm-style-mtc, .gmnoprint { display: none !important; }
      `}</style>
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-muted/20 rounded-lg relative overflow-hidden"
      />

      {/* Map controls - Right column */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="glass"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="glass"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="glass"
          onClick={handleLocate}
        >
          <Locate className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className={`glass ${showHeatmap ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={toggleHeatmap}
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Map/Satellite + Fullscreen controls - Left column */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="glass rounded-lg p-1 flex">
          <Button
            variant={mapType === 'roadmap' ? 'secondary' : 'ghost'}
            size="sm"
            className={`${mapType === 'roadmap' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={setMapTypeRoadmap}
          >
            Map
          </Button>
          <Button
            variant={mapType === 'satellite' ? 'secondary' : 'ghost'}
            size="sm"
            className={`${mapType === 'satellite' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={setMapTypeSatellite}
          >
            Satellite
          </Button>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="glass"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Legend */}
      <Card className="glass absolute bottom-4 left-4 p-3">
        <div className="text-xs font-semibold mb-2">Property Status</div>
        <div className="space-y-1.5">
          {[
            { status: 'for-sale', label: 'For Sale' },
            { status: 'off-market', label: 'Off Market' },
            { status: 'trending', label: 'Trending' },
            { status: 'flagged', label: 'Flagged' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: getStatusColor(status) }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Selected property mini card */}
      {selectedProperty && (
        <Card className="glass absolute bottom-4 right-4 p-4 max-w-sm animate-slide-up">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                {selectedProperty.title}
              </h4>
              <Badge variant="outline" className="text-xs">
                Trust Score: {selectedProperty.trustScore}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProperty(null)}
            >
              ×
            </Button>
          </div>
          <div className="text-sm font-semibold text-primary">
            ${(selectedProperty.price / 1000000).toFixed(1)}M
          </div>
          <Button 
            size="sm" 
            className="w-full mt-3"
            onClick={() => onPropertySelect?.(selectedProperty)}
          >
            View Details
          </Button>
        </Card>
      )}
    </div>
  );
};

export default memo(MapView);
