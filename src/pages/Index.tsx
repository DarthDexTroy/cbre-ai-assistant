import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import MapView from "@/components/MapView";
import PropertyCard from "@/components/PropertyCard";
import AIChat from "@/components/AIChat";
import OnboardingWizard from "@/components/OnboardingWizard";
import TrustScoreMeter from "@/components/TrustScoreMeter";
import {
  Search,
  Menu,
  Bell,
  User,
  Bookmark,
  Settings,
  LogOut,
  Sparkles,
  Filter,
} from "lucide-react";
import propertiesData from "@/data/properties.json";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
  login,
  getUnreadAlertCount,
  hasCompletedOnboarding,
} from "@/lib/localStorage";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Index = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding());
  const [showAuth, setShowAuth] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [unreadCount, setUnreadCount] = useState(getUnreadAlertCount());
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    toast.success("Logged out successfully");
  };

  const filteredProperties = propertiesData.filter((property) => {
    const query = searchQuery.toLowerCase();
    return (
      property.title.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      property.type.toLowerCase().includes(query)
    );
  });

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
                <Button variant="ghost" className="w-full justify-start">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved Properties
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Alerts
                  {unreadCount > 0 && (
                    <Badge className="ml-auto" variant="destructive">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>

              {/* Logout */}
              <div className="pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
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
              placeholder="Search properties or ask AI anything..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={() => setShowChat(!showChat)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            properties={filteredProperties}
            onPropertySelect={setSelectedProperty}
          />
        </div>

        {/* Sidebar - Property list */}
        <div className="w-96 border-l border-border/50 glass flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold mb-1">Properties</h2>
            <p className="text-sm text-muted-foreground">
              {filteredProperties.length} results
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* AI Chat - Floating */}
        {showChat && (
          <div className="absolute bottom-4 right-4 w-96 h-[600px] z-20 animate-slide-up">
            <AIChat />
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
              {selectedProperty.images?.[0] && (
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

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
                    <div className="text-xl font-semibold">
                      {selectedProperty.sqft.toLocaleString()} SF
                    </div>
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
                <p className="text-sm text-muted-foreground">{selectedProperty.description}</p>
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
            <DialogDescription>
              Enter your details to start exploring verified real estate data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Your Name"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />
            <Button className="w-full" onClick={handleLogin}>
              Get Started
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo mode - Data stored locally in browser
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default Index;
