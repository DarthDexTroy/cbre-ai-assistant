import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react";
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

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current!, {
        center: center || { lat: 39.8283, lng: -98.5795 },
        zoom: 5,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0a1929" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8b92a8" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0a1929" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#003d5c" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
        ],
      });

      const markers: any[] = [];
      properties.forEach(property => {
        const marker = new window.google.maps.Marker({
          position: { lat: property.lat, lng: property.lng },
          map: map,
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

        markers.push(marker);
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
  }, [properties, center, onPropertySelect]);

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

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-muted/20 rounded-lg relative overflow-hidden"
      />

      {/* Map controls */}
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

export default MapView;
