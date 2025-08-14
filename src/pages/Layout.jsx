

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isAdmin, hasPermission, getUserRole } from '@/utils/adminRoles';
import SmartLink from "@/components/SmartLink";
import { 
  Anchor, 
  Search, 
  Plus, 
  User, 
  Settings,
  LayoutDashboard,
  Ship,
  Calendar,
  CreditCard,
  Menu,
  X,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isAdminPage = currentPageName === "Admin";
  const isPublicPage = ["Home", "Search", "BoatDetails", "Booking"].includes(currentPageName);

  // Get user role for navigation
  const userRole = getUserRole(currentUser);

  // Generate navigation items based on user role
  const getNavigationItems = () => {
    if (!currentUser) {
      // Guest users
      return [
        { label: "Explore Boats", href: createPageUrl("Search"), icon: Search },
        { label: "List Your Boat", href: "/auth", icon: Plus, requiresAuth: true },
        { label: "Sign In", href: "/auth", icon: User }
      ];
    }

    // Logged in users
    const items = [
      { label: "Dashboard", href: createPageUrl("Dashboard"), icon: LayoutDashboard },
      { label: "My Bookings", href: createPageUrl("MyBookings"), icon: Calendar }
    ];

    // Add owner-specific items (if they have boats)
    if (userRole === 'admin' || currentUser.boats?.length > 0) {
      items.push(
        { label: "Owner Dashboard", href: createPageUrl("OwnerDashboard"), icon: Ship },
        { label: "My Boats", href: createPageUrl("MyBoats"), icon: Ship }
      );
    }

    // Add admin panel for admins
    if (hasPermission(currentUser, 'access_admin_panel')) {
      items.push(
        { label: "Admin Panel", href: createPageUrl("Admin"), icon: AlertTriangle, isAdmin: true }
      );
    }

    // Add List Your Boat for all logged in users
    items.push({ label: "List Your Boat", href: createPageUrl("ListBoat"), icon: Plus });

    return items;
  };

  const navigationItems = getNavigationItems();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>
        {`
          :root {
            --primary-navy: #0B1426;
            --ocean-blue: #1E40AF;
            --deep-blue: #1E3A8A;
            --light-blue: #3B82F6;
            --accent-gold: #F59E0B;
            --soft-white: #FEFEFE;
            --warm-gray: #F8FAFC;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .luxury-gradient {
            background: linear-gradient(135deg, var(--primary-navy) 0%, var(--ocean-blue) 100%);
          }
          
          .floating-animation {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .wave-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E0E7FF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 luxury-gradient rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">SydneyCharter</span>
                <span className="text-xs text-slate-500 -mt-1">Premium Boat Rentals</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {isPublicPage && (
                <>
                  <Link to={createPageUrl("Search")} className="text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200">
                    Explore Boats
                  </Link>
                  <SmartLink 
                    to={createPageUrl("ListBoat")} 
                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    List Your Boat
                  </SmartLink>
                </>
              )}
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {currentUser.displayName?.[0] || currentUser.email[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-slate-700">{currentUser.displayName || currentUser.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {navigationItems.map((item, index) => (
                      <React.Fragment key={item.label}>
                        {item.isAdmin && <DropdownMenuSeparator />}
                        <DropdownMenuItem asChild>
                          <Link to={item.href} className="flex items-center space-x-2">
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                        {item.isAdmin && <DropdownMenuSeparator />}
                      </React.Fragment>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  asChild
                  className="luxury-gradient text-white hover:opacity-90 transition-opacity duration-200"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-effect border-t border-white/20">
            <div className="px-4 py-6 space-y-4">
              {isPublicPage && (
                <>
                  <Link 
                    to={createPageUrl("Search")} 
                    className="block text-slate-700 hover:text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Explore Boats
                  </Link>
                  <SmartLink 
                    to={createPageUrl("ListBoat")} 
                    className="block text-slate-700 hover:text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    List Your Boat
                  </SmartLink>
                </>
              )}
              
              {currentUser ? (
                <div className="space-y-3 pt-4 border-t border-white/20">
                  {navigationItems.map((item, index) => (
                    <Link 
                      key={item.label}
                      to={item.href} 
                      className="block text-slate-700 hover:text-blue-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left text-slate-700 hover:text-blue-600 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Button 
                  asChild
                  className="w-full luxury-gradient text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      {isPublicPage && (
        <footer className="wave-pattern bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Anchor className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">SydneyCharter</h3>
                    <p className="text-slate-400 text-sm">Premium Boat Rentals</p>
                  </div>
                </div>
                <p className="text-slate-400">
                  Experience Sydney Harbour like never before with our premium boat charter service.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">For Guests</h4>
                <div className="space-y-2 text-slate-400">
                  <p>Browse boats</p>
                  <p>Book instantly</p>
                  <p>Customer support</p>
                  <p>Safety guidelines</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">For Hosts</h4>
                <div className="space-y-2 text-slate-400">
                  <p>List your boat</p>
                  <p>Earn money</p>
                  <p>Host resources</p>
                  <p>Insurance info</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <div className="space-y-2 text-slate-400">
                  <p>Terms of service</p>
                  <p>Privacy policy</p>
                  <p>Cancellation policy</p>
                  <p>Licensing requirements</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-slate-400">
                  © 2024 SydneyCharter. All rights reserved.
                </p>
                <p className="text-sm text-slate-500">
                  Boat owners are responsible for appropriate licenses and liability insurance
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

