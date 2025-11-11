import { useEffect, useRef, useState, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ZoomIn, ZoomOut, Locate, Maximize2, Minimize2, X } from "lucide-react";
import { toast } from "sonner";
import { getFallbackImageUrl, getOptimizedImageUrl } from "@/lib/imageUtils";

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

interface Property {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  trustScore: number;
  price: number;
  sqft: number;
  type?: string;
  occupancy?: number;
  images?: string[];
  keyFeatures?: string[];
  description?: string;
}

interface MapViewProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  center?: { lat: number; lng: number };
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCuTnm4KB_XBYNiq7vMCXAi1b-n66HvGIg";

const MapView = ({ properties, onPropertySelect, center }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const markersRef = useRef<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const [showDetails, setShowDetails] = useState(false);
  const [hideMini, setHideMini] = useState(false);

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
    const nextIds = new Set<string>();
    // Upsert markers
    properties.forEach((property) => {
      nextIds.add(property.id);
      const existing = markersMapRef.current.get(property.id);
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: getStatusColor(property.status),
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };
      if (existing) {
        existing.setPosition({ lat: property.lat, lng: property.lng });
        existing.setTitle(property.title);
        existing.setIcon(icon);
      } else {
        const marker = new window.google.maps.Marker({
          position: { lat: property.lat, lng: property.lng },
          map: mapInstance,
          title: property.title,
          icon,
        });
        marker.addListener('click', () => {
          setSelectedProperty(property);
          // Reset panels on new selection
          if (isFullscreen) setShowDetails(false);
          setHideMini(false);
          onPropertySelect?.(property);
        });
        markersMapRef.current.set(property.id, marker);
      }
    });
    // Remove outdated markers
    Array.from(markersMapRef.current.keys()).forEach((id) => {
      if (!nextIds.has(id)) {
        const m = markersMapRef.current.get(id);
        if (m) m.setMap(null);
        markersMapRef.current.delete(id);
      }
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

  const setMapTypeRoadmap = () => {
    setMapType('roadmap');
    if (mapInstance) mapInstance.setMapTypeId('roadmap');
  };

  const setMapTypeSatellite = () => {
    setMapType('satellite');
    if (mapInstance) mapInstance.setMapTypeId('satellite');
  };

  // Keep isFullscreen in sync with the browser Fullscreen API
  useEffect(() => {
    const handler = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      setTimeout(() => {
        if (mapInstance && window.google?.maps?.event) {
          window.google.maps.event.trigger(mapInstance, "resize");
        }
      }, 200);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [mapInstance]);

  const requestFs = async (el: HTMLElement) => {
    const anyEl = el as any;
    if (el.requestFullscreen) return el.requestFullscreen();
    if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
    if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
  };
  const exitFs = async () => {
    const anyDoc = document as any;
    if (document.exitFullscreen) return document.exitFullscreen();
    if (anyDoc.webkitExitFullscreen) return anyDoc.webkitExitFullscreen();
    if (anyDoc.msExitFullscreen) return anyDoc.msExitFullscreen();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && wrapperRef.current) {
        await requestFs(wrapperRef.current);
      } else {
        await exitFs();
      }
    } catch (e) {
      // Fallback to CSS full-window if FS API fails
      setIsFullscreen(v => !v);
      setTimeout(() => {
        if (mapInstance && window.google?.maps?.event) {
          window.google.maps.event.trigger(mapInstance, "resize");
        }
      }, 200);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
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

      {/* Selected property mini card (fullscreen only) */}
      {isFullscreen && selectedProperty && !showDetails && !hideMini && (
        <Card className="glass absolute bottom-4 right-4 p-4 w-[360px] animate-slide-up">
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
              size="icon"
              className="h-8 w-8 rounded-md bg-background/80 hover:bg-background border border-border/50"
              onClick={() => setSelectedProperty(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {selectedProperty.images?.[0] && (
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-full h-28 object-cover rounded-md mb-2"
            />
          )}
          <div className="text-sm font-semibold text-primary">
            ${(selectedProperty.price / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-muted-foreground mt-1">Status: {selectedProperty.status}</div>
          <Button
            size="sm"
            className="w-full mt-3"
            onClick={() => {
              setShowDetails(true);
              setHideMini(true);
            }}
          >
            View Details
          </Button>
        </Card>
      )}

      {/* Fullscreen detail overlay (not full-screen) */}
      {isFullscreen && selectedProperty && showDetails && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <Card className="glass w-full max-w-3xl max-h-[85vh] overflow-y-auto p-4 relative">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{selectedProperty.title}</h3>
                <div className="text-sm text-muted-foreground">{selectedProperty.address}</div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 rounded-md bg-background/80 hover:bg-background border border-border/50 hover:scale-110 transition-all"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <img
              src={
                selectedProperty.images?.[0]
                  ? getOptimizedImageUrl(selectedProperty.images[0], isFullscreen ? 'fullscreen' : 'detail')
                  : getFallbackImageUrl(selectedProperty.type)
              }
              alt={selectedProperty.title}
              className="w-full h-60 object-cover rounded-lg mb-4 bg-muted"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getOptimizedImageUrl(
                  getFallbackImageUrl(selectedProperty.type),
                  isFullscreen ? 'fullscreen' : 'detail'
                );
              }}
            />
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="text-xl font-semibold text-primary">
                  ${(selectedProperty.price / 1000000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Size</div>
                <div className="text-xl font-semibold">
                  {selectedProperty.sqft.toLocaleString()} SF
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Occupancy</div>
                <div className="text-xl font-semibold">{selectedProperty.occupancy}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
                <div className="text-xl font-semibold">{selectedProperty.trustScore}</div>
              </div>
            </div>
            {selectedProperty.description && (
              <div className="mb-4">
                <div className="font-semibold mb-1">Description</div>
                <div className="text-sm text-muted-foreground">{selectedProperty.description}</div>
              </div>
            )}
            {selectedProperty.keyFeatures && (
              <div className="mb-4">
                <div className="font-semibold mb-1">Key Features</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.keyFeatures.map((f: string, idx: number) => (
                    <Badge key={idx} variant="outline">{f}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
              <Button onClick={() => { setShowDetails(false); /* keep fullscreen view */ }}>OK</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default memo(MapView);
