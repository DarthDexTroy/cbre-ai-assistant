import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react";
import { toast } from "sonner";

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

// TODO: Add Google Maps API Key
// 1. Get API key from: https://console.cloud.google.com/google/maps-apis
// 2. Enable Maps JavaScript API and Places API
// 3. Add to environment variables or directly in code
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

const MapView = ({ properties, onPropertySelect, center }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual Google Maps initialization
    // This is a placeholder that shows what the map area would look like
    
    /*
    Example Google Maps initialization:
    
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,visualization`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const map = new google.maps.Map(mapRef.current!, {
        center: center || { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: 5,
        styles: [ // Dark mode styling
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#212121" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
          },
          // ... more styling
        ],
      });

      // Add markers for each property
      properties.forEach(property => {
        const marker = new google.maps.Marker({
          position: { lat: property.lat, lng: property.lng },
          map: map,
          title: property.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
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
      });

      setMapInstance(map);
    }
    */

    // Show placeholder message
    if (!mapRef.current) return;
    
    toast.info("Google Maps API key required", {
      description: "Add your API key to enable the interactive map",
      duration: 5000,
    });

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
    toast.info("Zoom in - Requires Google Maps API");
  };

  const handleZoomOut = () => {
    toast.info("Zoom out - Requires Google Maps API");
  };

  const handleLocate = () => {
    toast.info("Locate me - Requires Google Maps API");
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
    toast.info(`Heatmap ${!showHeatmap ? 'enabled' : 'disabled'} - Requires Google Maps API`);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-muted/20 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsl(var(--secondary) / 0.1) 0%, transparent 50%)
          `,
        }}
      >
        {/* Placeholder content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="glass p-8 max-w-md text-center space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-primary animate-float" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Google Maps Integration</h3>
              <p className="text-sm text-muted-foreground">
                Add your Google Maps API key to enable the interactive map with property markers,
                clustering, and heatmap overlays.
              </p>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <strong>API Key Configuration:</strong><br />
                Update <code className="bg-muted px-2 py-1 rounded">GOOGLE_MAPS_API_KEY</code> in MapView.tsx
              </p>
            </div>
          </Card>
        </div>

        {/* Simulated property markers */}
        <div className="absolute inset-0 pointer-events-none">
          {properties.slice(0, 6).map((property, index) => (
            <div
              key={property.id}
              className="absolute animate-pulse-glow pointer-events-auto cursor-pointer"
              style={{
                left: `${20 + (index * 12)}%`,
                top: `${30 + (index % 3) * 20}%`,
              }}
              onClick={() => {
                setSelectedProperty(property);
                onPropertySelect?.(property);
              }}
            >
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: getStatusColor(property.status) }}
              />
            </div>
          ))}
        </div>
      </div>

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
