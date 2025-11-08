import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TrustScoreMeter from "./TrustScoreMeter";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { isPropertySaved, saveProperty, unsaveProperty } from "@/lib/localStorage";
import { useState } from "react";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  class: string;
  price: number;
  sqft: number;
  status: string;
  trustScore: number;
  lastUpdated: string;
  images?: string[];
  yearBuilt?: number;
  occupancy?: number;
}

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

const PropertyCard = ({ property, onSelect }: PropertyCardProps) => {
  const [saved, setSaved] = useState(isPropertySaved(property.id));

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      unsaveProperty(property.id);
      setSaved(false);
      toast.success("Removed from saved properties");
    } else {
      saveProperty(property.id);
      setSaved(true);
      toast.success("Property saved successfully");
    }
  };

  const statusColors: Record<string, string> = {
    'for-sale': 'bg-primary',
    'off-market': 'bg-secondary',
    'trending': 'bg-trust-medium',
    'flagged': 'bg-trust-low',
  };

  const statusLabels: Record<string, string> = {
    'for-sale': 'For Sale',
    'off-market': 'Off Market',
    'trending': 'Trending',
    'flagged': 'Flagged',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Card 
      className="glass hover-lift cursor-pointer overflow-hidden group transition-all duration-300"
      onClick={() => onSelect?.(property)}
    >
      {/* Image */}
      {property.images && property.images[0] && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          {/* Status badge */}
          <Badge 
            className={`absolute top-3 left-3 ${statusColors[property.status]} text-white border-0`}
          >
            {statusLabels[property.status]}
          </Badge>

          {/* Trust score */}
          <div className="absolute top-3 right-3">
            <TrustScoreMeter score={property.trustScore} size="sm" showLabel={false} animated={false} />
          </div>

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-3 right-3 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            onClick={handleSave}
          >
            {saved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-start gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{property.address}</span>
          </div>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{property.type} - Class {property.class}</span>
          </div>
          {property.yearBuilt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{property.yearBuilt}</span>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Price</div>
            <div className="font-semibold text-primary flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatPrice(property.price)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Size</div>
            <div className="font-semibold">
              {formatNumber(property.sqft)} SF
            </div>
          </div>
        </div>

        {property.occupancy !== undefined && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground">Occupancy</span>
            <span className="font-semibold flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-trust-high" />
              {property.occupancy}%
            </span>
          </div>
        )}

        {/* View details */}
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
        >
          View Details
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

export default PropertyCard;
