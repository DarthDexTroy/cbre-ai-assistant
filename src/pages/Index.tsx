import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import MapView from "@/components/MapView";
import PropertyCard from "@/components/PropertyCard";
import AIChat from "@/components/AIChat";
import OnboardingWizard from "@/components/OnboardingWizard";
import TrustScoreMeter from "@/components/TrustScoreMeter";
import { buildRichPropertyDescription, redistributeStatuses } from "@/lib/utils";
import type { ChatMessage } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { Search, Menu, User, Bookmark, LogOut, Sparkles, Filter, TrendingUp, X } from "lucide-react";
import propertiesData from "@/data/properties.json";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
  login,
  hasCompletedOnboarding,
  getSavedProperties,
} from "@/lib/localStorage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getFallbackImageUrl, getOptimizedImageUrl } from "@/lib/imageUtils";

const Index = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding());
  const [showAuth, setShowAuth] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedProperties, setShowSavedProperties] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState<any[]>([]);
  const [selectedAnalyticsProperty, setSelectedAnalyticsProperty] = useState<any | null>(null);
  const [comparisonSearch, setComparisonSearch] = useState("");
  const [analyticsSearch, setAnalyticsSearch] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    types: new Set<string>(),
    classes: new Set<string>(),
    statuses: new Set<string>(),
    priceMin: "",
    priceMax: "",
    sqftMin: "",
    sqftMax: "",
    yearMin: "",
    yearMax: "",
    occMin: "",
    occMax: "",
    trustMin: "",
    trustMax: "",
  });

  const redistributed = redistributeStatuses(propertiesData as any, {
    ["off-market"]: 0.4,
    ["for-sale"]: 0.3,
    trending: 0.2,
    flagged: 0.1,
  }) as any[];

  const typeOptions = Array.from(new Set(redistributed.map((p) => p.type))).sort();
  const classOptions = Array.from(new Set(redistributed.map((p) => p.class))).sort();
  const statusOptions = Array.from(new Set(redistributed.map((p) => p.status))).sort();

  const activeFiltersCount = (() => {
    let count = 0;
    if (filters.location.trim()) count++;
    count += filters.types.size;
    count += filters.classes.size;
    count += filters.statuses.size;
    const numeric = [
      filters.priceMin,
      filters.priceMax,
      filters.sqftMin,
      filters.sqftMax,
      filters.yearMin,
      filters.yearMax,
      filters.occMin,
      filters.occMax,
      filters.trustMin,
      filters.trustMax,
    ].filter((v) => String(v).trim() !== "");
    count += numeric.length;
    return count;
  })();

  useEffect(() => {
    if (!isAuthenticated()) {
      setShowAuth(true);
    }
  }, []);

  const handleLogin = () => {
    if (!authName || !authEmail) {
      toast.error("Please enter your name and email");
      return;
    }
    const newUser = login(authEmail, authName);
    setUser(newUser);
    setShowAuth(false);
    toast.success(`Welcome, ${newUser.name}!`);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setSidebarOpen(false);
    setShowAuth(true);
    toast.success("Logged out successfully");
  };

  const filteredProperties = redistributed
    .filter((property) => {
      const query = searchQuery.toLowerCase();
      return (
        property.title.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.type.toLowerCase().includes(query)
      );
    })
    .filter((p) => {
      // Location (substring of address or title)
      if (filters.location.trim()) {
        const q = filters.location.toLowerCase();
        if (!(p.address.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))) return false;
      }
      // Type/Class/Status
      if (filters.types.size && !filters.types.has(p.type)) return false;
      if (filters.classes.size && !filters.classes.has(p.class)) return false;
      if (filters.statuses.size && !filters.statuses.has(p.status)) return false;
      // Price
      if (String(filters.priceMin).trim() !== "") {
        const min = Number(filters.priceMin) || 0;
        if (p.price < min) return false;
      }
      if (String(filters.priceMax).trim() !== "") {
        const max = Number(filters.priceMax) || 0;
        if (p.price > max) return false;
      }
      // Sqft
      if (String(filters.sqftMin).trim() !== "") {
        const min = Number(filters.sqftMin) || 0;
        if (p.sqft < min) return false;
      }
      if (String(filters.sqftMax).trim() !== "") {
        const max = Number(filters.sqftMax) || 0;
        if (p.sqft > max) return false;
      }
      // Year built
      if (String(filters.yearMin).trim() !== "") {
        const min = Number(filters.yearMin) || 0;
        if ((p.yearBuilt || 0) < min) return false;
      }
      if (String(filters.yearMax).trim() !== "") {
        const max = Number(filters.yearMax) || 0;
        if ((p.yearBuilt || 0) > max) return false;
      }
      // Occupancy
      if (String(filters.occMin).trim() !== "") {
        const min = Number(filters.occMin) || 0;
        if ((p.occupancy || 0) < min) return false;
      }
      if (String(filters.occMax).trim() !== "") {
        const max = Number(filters.occMax) || 0;
        if ((p.occupancy || 0) > max) return false;
      }
      // Trust score
      if (String(filters.trustMin).trim() !== "") {
        const min = Number(filters.trustMin) || 0;
        if ((p.trustScore || 0) < min) return false;
      }
      if (String(filters.trustMax).trim() !== "") {
        const max = Number(filters.trustMax) || 0;
        if ((p.trustScore || 0) > max) return false;
      }
      return true;
    });

  const toggleSetValue = (setObj: Set<string>, val: string) => {
    const next = new Set(Array.from(setObj));
    if (next.has(val)) next.delete(val);
    else next.add(val);
    return next;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 p-4 flex items-center gap-4 z-10">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass w-80">
            <div className="space-y-6">
              {/* User profile */}
              {user && (
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setShowSavedProperties(true);
                    setSidebarOpen(false);
                  }}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved Properties
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setShowComparison(true);
                    setSidebarOpen(false);
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Compare Properties
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setShowAnalytics(true);
                    setSidebarOpen(false);
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </nav>

              {/* Logout */}
              <div className="pt-4 border-t border-border/50">
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">TrustEstate AI</h1>
            <p className="text-xs text-muted-foreground">Powered by CBRE & Gemini</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties"
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex" onClick={() => setShowChat(!showChat)}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView properties={filteredProperties} onPropertySelect={setSelectedProperty} />
        </div>

        {/* Sidebar - Property list */}
        <div className="w-96 border-l border-border/50 glass flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold mb-1">Properties</h2>
              <p className="text-sm text-muted-foreground">{filteredProperties.length} results</p>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activeFiltersCount} filters
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} onSelect={setSelectedProperty} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* AI Chat - Floating */}
        {showChat && (
          <div className="absolute bottom-4 right-4 w-96 h-[600px] z-20 animate-slide-up">
            <AIChat
              initialMessages={chatHistory || undefined}
              onClose={(messages) => {
                setChatHistory(messages); // keep in-memory only; reset on page refresh
                setShowChat(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Property Detail Dialog */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProperty.title}</DialogTitle>
              <DialogDescription>{selectedProperty.address}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Image */}
              <img
                src={
                  selectedProperty.images?.[0]
                    ? getOptimizedImageUrl(selectedProperty.images[0], 'detail')
                    : getFallbackImageUrl(selectedProperty.type)
                }
                alt={selectedProperty.title}
                className="w-full h-64 object-cover rounded-lg bg-muted"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getOptimizedImageUrl(getFallbackImageUrl(selectedProperty.type), 'detail');
                }}
              />

              {/* Trust & Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-center">
                  <TrustScoreMeter score={selectedProperty.trustScore} size="lg" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="text-2xl font-bold text-primary">
                      ${(selectedProperty.price / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Size</div>
                    <div className="text-xl font-semibold">{selectedProperty.sqft.toLocaleString()} SF</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Occupancy</div>
                    <div className="text-xl font-semibold">{selectedProperty.occupancy}%</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProperty.description && selectedProperty.description.length > 200
                    ? selectedProperty.description
                    : buildRichPropertyDescription(selectedProperty)}
                </p>
              </div>

              {/* Features */}
              {selectedProperty.keyFeatures && (
                <div>
                  <h3 className="font-semibold mb-2">Key Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProperty.keyFeatures.map((feature: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              {selectedProperty.sources && (
                <div>
                  <h3 className="font-semibold mb-2">Verified Sources</h3>
                  <div className="space-y-2">
                    {selectedProperty.sources.map((source: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant={source.verified ? "default" : "secondary"}>
                          {source.verified ? "Verified" : "Pending"}
                        </Badge>
                        <span>{source.name}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{source.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Welcome to TrustEstate AI</DialogTitle>
            <DialogDescription>Enter your details to start exploring verified real estate data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Your Name" value={authName} onChange={(e) => setAuthName(e.target.value)} />
            <Input
              type="email"
              placeholder="Email Address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />
            <Button className="w-full" onClick={handleLogin}>
              Get Started
            </Button>
            <p className="text-xs text-center text-muted-foreground">Demo mode - Data stored locally in browser</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="glass max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription>Refine properties by attributes and ranges</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick toggles */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Location</div>
                <Input
                  placeholder="City, state or address..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Type</div>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <Button
                      key={t}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs",
                        filters.types.has(t) ? "bg-primary text-primary-foreground border-primary" : "",
                      )}
                      onClick={() => setFilters({ ...filters, types: toggleSetValue(filters.types, t) })}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Class</div>
                <div className="flex flex-wrap gap-2">
                  {classOptions.map((c) => (
                    <Button
                      key={c}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs",
                        filters.classes.has(c) ? "bg-primary text-primary-foreground border-primary" : "",
                      )}
                      onClick={() => setFilters({ ...filters, classes: toggleSetValue(filters.classes, c) })}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Status</div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-xs",
                      filters.statuses.has(s) ? "bg-primary text-primary-foreground border-primary" : "",
                    )}
                    onClick={() => setFilters({ ...filters, statuses: toggleSetValue(filters.statuses, s) })}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {/* Ranges */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Price (USD)</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Size (SF)</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.sqftMin}
                    onChange={(e) => setFilters({ ...filters, sqftMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.sqftMax}
                    onChange={(e) => setFilters({ ...filters, sqftMax: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Year Built</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.yearMin}
                    onChange={(e) => setFilters({ ...filters, yearMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.yearMax}
                    onChange={(e) => setFilters({ ...filters, yearMax: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Occupancy (%)</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.occMin}
                    onChange={(e) => setFilters({ ...filters, occMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.occMax}
                    onChange={(e) => setFilters({ ...filters, occMax: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Trust Score</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.trustMin}
                    onChange={(e) => setFilters({ ...filters, trustMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.trustMax}
                    onChange={(e) => setFilters({ ...filters, trustMax: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() =>
                  setFilters({
                    location: "",
                    types: new Set(),
                    classes: new Set(),
                    statuses: new Set(),
                    priceMin: "",
                    priceMax: "",
                    sqftMin: "",
                    sqftMax: "",
                    yearMin: "",
                    yearMax: "",
                    occMin: "",
                    occMax: "",
                    trustMin: "",
                    trustMax: "",
                  })
                }
              >
                Clear Filters
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowFilters(false)}>Apply</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Properties Dialog */}
      <Dialog open={showSavedProperties} onOpenChange={setShowSavedProperties}>
        <DialogContent className="glass max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Saved Properties</DialogTitle>
            <DialogDescription>Your bookmarked properties</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 p-4">
              {(() => {
                const savedProps = getSavedProperties();
                const savedPropertyData = savedProps
                  .map(sp => redistributed.find(p => p.id === sp.propertyId))
                  .filter(Boolean);

                if (savedPropertyData.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No saved properties yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click the bookmark icon on any property to save it
                      </p>
                    </div>
                  );
                }

                return savedPropertyData.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onSelect={(p) => {
                      setSelectedProperty(p);
                      setShowSavedProperties(false);
                    }}
                  />
                ));
              })()}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Compare Properties Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="glass max-w-6xl h-[90vh] flex flex-col p-0">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle>Compare Properties</DialogTitle>
              <DialogDescription>Select up to 3 properties to compare side by side</DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Property Selection Dropdowns */}
          <div className="px-6 pb-4 space-y-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{comparisonProperties.length}/3 selected</Badge>
              {comparisonProperties.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setComparisonProperties([])}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Property Selector Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={comparisonProperties.length >= 3}
                >
                  <span>
                    {comparisonProperties.length >= 3
                      ? "Maximum 3 properties selected"
                      : "Select a property to compare..."}
                  </span>
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0 z-50 bg-background border" align="start">
                <div className="p-3 border-b bg-background sticky top-0 z-10">
                  <Input
                    placeholder="Search properties..."
                    value={comparisonSearch}
                    onChange={(e) => setComparisonSearch(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {(() => {
                    const savedPropertyIds = getSavedProperties().map(sp => sp.propertyId);
                    const propertiesToShow = comparisonSearch.trim() === ""
                      ? redistributed.filter(p => savedPropertyIds.includes(p.id) && !comparisonProperties.find(cp => cp.id === p.id))
                      : redistributed.filter(p => {
                          const matchesSearch = p.title.toLowerCase().includes(comparisonSearch.toLowerCase()) ||
                            p.address.toLowerCase().includes(comparisonSearch.toLowerCase());
                          const notSelected = !comparisonProperties.find(cp => cp.id === p.id);
                          return matchesSearch && notSelected;
                        });
                    
                    if (propertiesToShow.length === 0) {
                      return (
                        <div className="p-8 text-center text-muted-foreground">
                          {comparisonSearch.trim() === ""
                            ? "No saved properties. Search to find properties."
                            : "No properties found"
                          }
                        </div>
                      );
                    }

                    return propertiesToShow.map((property) => (
                      <Button
                        key={property.id}
                        variant="ghost"
                        className="w-full h-auto p-3 justify-start text-left hover:bg-muted rounded-none border-b"
                        onClick={() => {
                          if (comparisonProperties.length < 3) {
                            setComparisonProperties([...comparisonProperties, property]);
                            setComparisonSearch("");
                          }
                        }}
                      >
                        <div className="flex gap-3 items-start w-full">
                          <img
                            src={property.images?.[0] ? getOptimizedImageUrl(property.images[0], 'card') : getFallbackImageUrl(property.type)}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm line-clamp-1">{property.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{property.address}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-xs font-semibold text-primary">
                                ${(property.price / 1000000).toFixed(1)}M • {property.type} • Class {property.class}
                              </div>
                              {savedPropertyIds.includes(property.id) && (
                                <Badge variant="secondary" className="text-xs">Saved</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ));
                  })()}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Properties Comparison */}
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <ScrollArea className="h-full">
              <div className="pr-4">
                {comparisonProperties.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {comparisonProperties.map((property) => (
                      <div key={property.id} className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            setComparisonProperties(comparisonProperties.filter(p => p.id !== property.id));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="glass p-4 rounded-lg space-y-3">
                          <img
                            src={property.images?.[0] ? getOptimizedImageUrl(property.images[0], 'card') : getFallbackImageUrl(property.type)}
                            alt={property.title}
                            className="w-full h-32 object-cover rounded"
                          />
                          <h4 className="font-semibold text-sm line-clamp-2">{property.title}</h4>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price</span>
                              <span className="font-semibold text-primary">${(property.price / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Size</span>
                              <span className="font-semibold">{property.sqft.toLocaleString()} SF</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">$/SF</span>
                              <span className="font-semibold">${Math.round(property.price / property.sqft)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type</span>
                              <span>{property.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Class</span>
                              <span>{property.class}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Occupancy</span>
                              <span>{property.occupancy}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trust Score</span>
                              <span className="font-semibold">{property.trustScore}/100</span>
                            </div>
                            {property.yearBuilt && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Year Built</span>
                                <span>{property.yearBuilt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select properties from the dropdown above to compare</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="glass max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Property Value Analytics</DialogTitle>
            <DialogDescription>Track individual property value trends over time</DialogDescription>
          </DialogHeader>
          
          {/* Property Search Dropdown */}
          <div className="flex-shrink-0 px-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                >
                  {selectedAnalyticsProperty ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedAnalyticsProperty.images?.[0] ? getOptimizedImageUrl(selectedAnalyticsProperty.images[0], 'card') : getFallbackImageUrl(selectedAnalyticsProperty.type)}
                        alt={selectedAnalyticsProperty.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-sm">{selectedAnalyticsProperty.title}</div>
                        <div className="text-xs text-muted-foreground">{selectedAnalyticsProperty.address}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select a property to analyze</span>
                  )}
                  <Search className="h-4 w-4 ml-2 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="start">
                <div className="sticky top-0 bg-popover z-10 p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties..."
                      className="pl-10"
                      value={analyticsSearch}
                      onChange={(e) => setAnalyticsSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {(() => {
                    const savedPropertyIds = getSavedProperties().map(sp => sp.propertyId);
                    const propertiesToShow = analyticsSearch.trim() === "" 
                      ? redistributed.filter(p => savedPropertyIds.includes(p.id))
                      : redistributed.filter(p => 
                          p.title.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
                          p.address.toLowerCase().includes(analyticsSearch.toLowerCase())
                        );
                    
                    if (propertiesToShow.length === 0) {
                      return (
                        <div className="p-8 text-center text-muted-foreground">
                          {analyticsSearch.trim() === "" 
                            ? "No saved properties. Search to find properties."
                            : "No properties found"
                          }
                        </div>
                      );
                    }

                    return propertiesToShow.map((property) => (
                      <Button
                        key={property.id}
                        variant="ghost"
                        className="w-full h-auto p-3 justify-start hover:bg-accent"
                        onClick={() => {
                          setSelectedAnalyticsProperty(property);
                          setAnalyticsSearch("");
                        }}
                      >
                        <div className="flex gap-3 items-start w-full">
                          <img
                            src={property.images?.[0] ? getOptimizedImageUrl(property.images[0], 'card') : getFallbackImageUrl(property.type)}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-semibold text-sm line-clamp-1">{property.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{property.address}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-xs font-semibold text-primary">
                                ${(property.price / 1000000).toFixed(1)}M
                              </div>
                              {savedPropertyIds.includes(property.id) && (
                                <Badge variant="secondary" className="text-xs">Saved</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ));
                  })()}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Analytics Content */}
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4">
                {selectedAnalyticsProperty ? (
                <>
                  {/* Property Overview */}
                  <div className="glass p-4 rounded-lg">
                    <div className="flex items-start gap-4">
                      <img
                        src={selectedAnalyticsProperty.images?.[0] ? getOptimizedImageUrl(selectedAnalyticsProperty.images[0], 'card') : getFallbackImageUrl(selectedAnalyticsProperty.type)}
                        alt={selectedAnalyticsProperty.title}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{selectedAnalyticsProperty.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{selectedAnalyticsProperty.address}</p>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground">Current Value</div>
                            <div className="text-xl font-bold text-primary">
                              ${(selectedAnalyticsProperty.price / 1000000).toFixed(1)}M
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Type</div>
                            <div className="font-semibold">{selectedAnalyticsProperty.type}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Class</div>
                            <div className="font-semibold">{selectedAnalyticsProperty.class}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Trust Score</div>
                            <div className="font-semibold">{selectedAnalyticsProperty.trustScore}/100</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Value Over Time Chart */}
                  <div>
                    <h3 className="font-semibold mb-4">Value History (Last 12 Months)</h3>
                    <div className="glass p-4 rounded-lg">
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={(() => {
                          const baseValue = selectedAnalyticsProperty.price / 1000000;
                          const variation = baseValue * 0.15;
                          return [
                            { month: 'Jan', value: baseValue - variation },
                            { month: 'Feb', value: baseValue - variation * 0.9 },
                            { month: 'Mar', value: baseValue - variation * 0.75 },
                            { month: 'Apr', value: baseValue - variation * 0.6 },
                            { month: 'May', value: baseValue - variation * 0.5 },
                            { month: 'Jun', value: baseValue - variation * 0.3 },
                            { month: 'Jul', value: baseValue - variation * 0.2 },
                            { month: 'Aug', value: baseValue - variation * 0.1 },
                            { month: 'Sep', value: baseValue - variation * 0.05 },
                            { month: 'Oct', value: baseValue },
                            { month: 'Nov', value: baseValue + variation * 0.05 },
                            { month: 'Dec', value: baseValue },
                          ];
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" />
                          <YAxis 
                            label={{ value: 'Value ($M)', angle: -90, position: 'insideLeft' }}
                            domain={['dataMin - 0.5', 'dataMax + 0.5']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: any) => [`$${value.toFixed(2)}M`, 'Value']}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            name="Property Value"
                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div>
                    <h3 className="font-semibold mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="glass p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">12-Month Growth</div>
                        <div className="text-2xl font-bold text-trust-high">+15.8%</div>
                        <div className="text-xs text-muted-foreground mt-1">Year over Year</div>
                      </div>
                      <div className="glass p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Occupancy</div>
                        <div className="text-2xl font-bold">{selectedAnalyticsProperty.occupancy}%</div>
                        <div className="text-xs text-muted-foreground mt-1">Current Rate</div>
                      </div>
                      <div className="glass p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Price per SF</div>
                        <div className="text-2xl font-bold">
                          ${Math.round(selectedAnalyticsProperty.price / selectedAnalyticsProperty.sqft)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Current Value</div>
                      </div>
                      <div className="glass p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Market Position</div>
                        <div className="text-2xl font-bold text-primary">Top 25%</div>
                        <div className="text-xs text-muted-foreground mt-1">In Category</div>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Trend */}
                  <div>
                    <h3 className="font-semibold mb-4">Occupancy Trend</h3>
                    <div className="glass p-4 rounded-lg">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={(() => {
                          const baseOccupancy = selectedAnalyticsProperty.occupancy || 85;
                          return [
                            { month: 'Jan', occupancy: baseOccupancy - 8 },
                            { month: 'Feb', occupancy: baseOccupancy - 6 },
                            { month: 'Mar', occupancy: baseOccupancy - 5 },
                            { month: 'Apr', occupancy: baseOccupancy - 4 },
                            { month: 'May', occupancy: baseOccupancy - 3 },
                            { month: 'Jun', occupancy: baseOccupancy - 2 },
                            { month: 'Jul', occupancy: baseOccupancy - 1 },
                            { month: 'Aug', occupancy: baseOccupancy },
                            { month: 'Sep', occupancy: baseOccupancy + 1 },
                            { month: 'Oct', occupancy: baseOccupancy + 2 },
                            { month: 'Nov', occupancy: baseOccupancy + 1 },
                            { month: 'Dec', occupancy: baseOccupancy },
                          ];
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" />
                          <YAxis 
                            label={{ value: 'Occupancy (%)', angle: -90, position: 'insideLeft' }}
                            domain={[60, 100]}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: any) => [`${value}%`, 'Occupancy']}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="occupancy" 
                            stroke="hsl(var(--trust-high))" 
                            strokeWidth={2}
                            name="Occupancy Rate"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a property using the dropdown above to view analytics</p>
                    <p className="text-sm text-muted-foreground mt-2">Saved properties are shown by default</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding */}
      <OnboardingWizard open={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </div>
  );
};

export default Index;
