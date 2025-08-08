import React, { useState, useEffect } from "react";
import { Boat, Review } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Star, 
  Calendar,
  Clock,
  Anchor,
  Wifi,
  Car,
  Utensils,
  Music,
  Waves,
  Shield,
  DollarSign
} from "lucide-react";

export default function BoatDetails() {
  const navigate = useNavigate();
  const [boat, setBoat] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const boatId = urlParams.get('id');

  useEffect(() => {
    loadBoatDetails();
  }, [boatId]);

  const loadBoatDetails = async () => {
    try {
      const boats = await Boat.filter({ id: boatId });
      if (boats.length > 0) {
        setBoat(boats[0]);
        // Load reviews for this boat
        const boatReviews = await Review.filter({ boat_id: boatId }, "-created_date");
        setReviews(boatReviews);
      }
    } catch (error) {
      console.error("Error loading boat details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('sound') || lowerAmenity.includes('music')) return Music;
    if (lowerAmenity.includes('wifi')) return Wifi;
    if (lowerAmenity.includes('galley') || lowerAmenity.includes('kitchen')) return Utensils;
    if (lowerAmenity.includes('swim') || lowerAmenity.includes('platform')) return Waves;
    if (lowerAmenity.includes('air') || lowerAmenity.includes('conditioning')) return Car;
    return Shield;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading boat details...</p>
        </div>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Boat not found</h2>
          <p className="text-slate-600">The boat you're looking for doesn't exist.</p>
          <Link to={createPageUrl("Search")}>
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{boat.rating || "New"}</span>
                <span className="text-slate-500">({boat.total_bookings} bookings)</span>
              </div>
              <Link to={createPageUrl(`Booking?id=${boat.id}`)}>
                <Button className="luxury-gradient text-white">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src={boat.images?.[selectedImage] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"} 
                  alt={boat.name}
                  className="w-full h-96 object-cover"
                />
                {boat.featured && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              
              {boat.images && boat.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {boat.images.slice(0, 5).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg ${
                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${boat.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Boat Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{boat.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {boat.boat_type.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{boat.location}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Up to {boat.max_guests} guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-700 leading-relaxed">{boat.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">What's Included</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {boat.amenities?.map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Services */}
              {boat.additional_services && boat.additional_services.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Additional Services</h3>
                  <div className="space-y-3">
                    {boat.additional_services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border">
                        <div>
                          <h4 className="font-semibold text-slate-900">{service.name}</h4>
                          <p className="text-slate-600 text-sm">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">${service.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Availability</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {boat.availability_blocks?.map((block, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{block.name}</h4>
                          <div className="flex items-center text-slate-600 mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{block.start_time} - {block.end_time}</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {block.duration_hours}h
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {review.customer_name?.[0] || "A"}
                              </span>
                            </div>
                            <span className="font-semibold">{review.customer_name || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && <h4 className="font-semibold mb-1">{review.title}</h4>}
                        <p className="text-slate-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No reviews yet. Be the first to book and review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pricing</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold">${boat.price_per_hour}</span>
                    <span className="text-slate-500">/hour</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Weekend rate:</span>
                    <span className="font-semibold">${boat.weekend_price || boat.price_per_hour * 1.2}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extended booking (7+ hours):</span>
                    <span className="font-semibold">${boat.extended_booking_price}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Down payment required:</span>
                    <span className="font-semibold">{boat.down_payment_percentage}%</span>
                  </div>
                  {boat.early_bird_discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Early bird discount:</span>
                      <span className="font-semibold">{boat.early_bird_discount}% ({boat.early_bird_days}+ days ahead)</span>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl(`Booking?id=${boat.id}`)} className="block">
                  <Button className="w-full luxury-gradient text-white hover:opacity-90 transition-opacity">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>

                <p className="text-xs text-slate-500 text-center">
                  {boat.with_captain ? "Captain included" : "Self-drive rental"}
                </p>
              </CardContent>
            </Card>

            {/* Special Pricing */}
            {boat.special_pricing && boat.special_pricing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Event Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {boat.special_pricing.map((pricing, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm">
                          {new Date(pricing.date).toLocaleDateString('en-AU', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          ${pricing.price_per_hour}/hr
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Host Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">H</span>
                  </div>
                  <div>
                    <p className="font-semibold">Host</p>
                    <p className="text-sm text-slate-500">Experienced boat owner</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">{boat.total_bookings || 0}</p>
                    <p className="text-slate-500">Total trips</p>
                  </div>
                  <div>
                    <p className="font-semibold">{boat.rating || "New"}</p>
                    <p className="text-slate-500">Average rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}