import React, { useState, useEffect } from "react";
import { Boat } from "@/api/entities";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Users, 
  Star,
  Clock,
  Anchor,
  Calendar,
  DollarSign
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export default function Search() {
  const [searchParams] = useSearchParams();
  const [boats, setBoats] = useState([]);
  const [filteredBoats, setFilteredBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlLocation);
  const [filters, setFilters] = useState({
    boatType: "all",
    priceRange: [0, 1000],
    guests: 1,
    withCaptain: null,
    location: searchParams.get("location") || ""
  });
  
  // Get search parameters from URL
  const urlLocation = searchParams.get("location") || "";
  const urlDate = searchParams.get("date") || "";

  useEffect(() => {
    // Load boats with URL search parameters
    const initialSearchParams = {
      status: "approved",
      location: urlLocation,
      date: urlDate
    };
    
    // Remove empty values
    Object.keys(initialSearchParams).forEach(key => 
      !initialSearchParams[key] ? delete initialSearchParams[key] : {}
    );
    
    loadBoats(initialSearchParams);
  }, [urlLocation, urlDate]);



  const loadBoats = async (searchParams = { status: "approved" }) => {
    try {
      setLoading(true);
      const boatData = await Boat.filter(searchParams);
      setBoats(boatData);
      setFilteredBoats(boatData); // Backend already filtered the results
    } catch (error) {
      console.error("Error loading boats:", error);
    } finally {
      setLoading(false);
    }
  };



  const applyFilters = () => {
    // Use the enhanced backend filtering instead of frontend filtering
    const searchParams = {
      status: "approved",
      boatType: filters.boatType,
      location: searchTerm || filters.location,
      max_guests: filters.guests,
      with_captain: filters.withCaptain,
      min_price: filters.priceRange[0],
      max_price: filters.priceRange[1],
      date: urlDate // This will trigger availability filtering in the backend
    };

    // Remove undefined/null values
    Object.keys(searchParams).forEach(key => 
      searchParams[key] === undefined || searchParams[key] === null || searchParams[key] === "" 
        ? delete searchParams[key] 
        : {}
    );

    // Fetch filtered boats from backend
    loadBoats(searchParams);
  };

  const boatTypes = [
    { value: "all", label: "All Types" },
    { value: "yacht", label: "Yacht" },
    { value: "catamaran", label: "Catamaran" },
    { value: "sailing_boat", label: "Sailing Boat" },
    { value: "motor_boat", label: "Motor Boat" },
    { value: "pontoon", label: "Pontoon" },
    { value: "speedboat", label: "Speedboat" },
    { value: "luxury_yacht", label: "Luxury Yacht" }
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Boat Type</h3>
        <Select value={filters.boatType} onValueChange={(value) => setFilters({...filters, boatType: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {boatTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range (per hour)</h3>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters({...filters, priceRange: value})}
            max={1000}
            min={0}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-600 mt-2">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Number of Guests</h3>
        <Select value={filters.guests.toString()} onValueChange={(value) => setFilters({...filters, guests: parseInt(value)})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1,2,4,6,8,10,12,15,20,25,30].map(num => (
              <SelectItem key={num} value={num.toString()}>{num} guests</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Captain Options</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all-captain"
              checked={filters.withCaptain === null}
              onCheckedChange={() => setFilters({...filters, withCaptain: null})}
            />
            <label htmlFor="all-captain" className="text-sm">All options</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="with-captain"
              checked={filters.withCaptain === true}
              onCheckedChange={() => setFilters({...filters, withCaptain: true})}
            />
            <label htmlFor="with-captain" className="text-sm">With captain</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="without-captain"
              checked={filters.withCaptain === false}
              onCheckedChange={() => setFilters({...filters, withCaptain: false})}
            />
            <label htmlFor="without-captain" className="text-sm">Self-drive</label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Location</h3>
        <Input
          placeholder="Enter location..."
          value={filters.location}
          onChange={(e) => {
            setFilters({...filters, location: e.target.value});
            setTimeout(() => applyFilters(), 500);
          }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading amazing boats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Discover Your Perfect Boat
          </h1>
          
          {/* Search Parameters Display */}
          {(urlLocation || urlDate) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Search Criteria:</h2>
              <div className="flex flex-wrap gap-4 text-sm text-blue-800">
                {urlLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {urlLocation}</span>
                  </div>
                )}
                {urlDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date: {new Date(urlDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by boat name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button 
              onClick={applyFilters}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
            >
              Search
            </Button>
            
            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-4">
              <Select value={filters.boatType} onValueChange={(value) => {
                setFilters({...filters, boatType: value});
                setTimeout(() => applyFilters(), 300);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boatTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.guests.toString()} onValueChange={(value) => {
                setFilters({...filters, guests: parseInt(value)});
                setTimeout(() => applyFilters(), 300);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,4,6,8,10,12,15,20,25,30].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} guests</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Boats</SheetTitle>
                  <SheetDescription>
                    Refine your search to find the perfect vessel
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="mt-4 text-slate-600">
            {filteredBoats.length} boats available
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                <FilterContent />
              </Card>
            </div>
          </div>

          {/* Boat Results */}
          <div className="lg:col-span-3">
            {filteredBoats.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No boats found</h3>
                <p className="text-slate-600">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBoats.map((boat) => (
                  <Link key={boat.id} to={createPageUrl(`BoatDetails?id=${boat.id}`)}>
                    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md">
                      <div className="relative overflow-hidden">
                        <img 
                          src={boat.images?.[0] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop"} 
                          alt={boat.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="glass-effect text-white border-white/20">
                            {boat.boat_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {boat.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              Featured
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 glass-effect rounded-lg px-2 py-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-white text-sm font-semibold">
                              {boat.rating || "New"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {boat.name}
                        </h3>
                        
                        <div className="flex items-center text-slate-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{boat.location}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{boat.max_guests} guests</span>
                            </div>
                            {boat.with_captain && (
                              <Badge variant="outline" className="text-xs">
                                With Captain
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">
                              ${boat.price_per_hour}
                            </div>
                            <div className="text-sm text-slate-500">per hour</div>
                          </div>
                          <Button size="sm" className="luxury-gradient text-white">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}