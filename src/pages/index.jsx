import Layout from "./Layout.jsx";

import Home from "./Home";

import Search from "./Search";

import ListBoat from "./ListBoat";

import BoatDetails from "./BoatDetails";

import MyBoats from "./MyBoats";

import Admin from "./Admin";

import BookingPage from "./Booking";

import BookingConfirmation from "./BookingConfirmation";

import MyBookings from "./MyBookings";

import Dashboard from "./Dashboard";

import OwnerBookingManagement from "./OwnerBookingManagement";

import OwnerDashboard from "./OwnerDashboard";

import StripeCallback from "./StripeCallback";

import CalendarCallback from "./CalendarCallback";

import AuthPage from "../components/auth/AuthPage";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Search: Search,
    
    ListBoat: ListBoat,
    
    BoatDetails: BoatDetails,
    
    MyBoats: MyBoats,
    
    Admin: Admin,
    
    Booking: BookingPage,
    
    BookingConfirmation: BookingConfirmation,
    
    MyBookings: MyBookings,
    
    Dashboard: Dashboard,
    
    OwnerBookingManagement: OwnerBookingManagement,
    
    OwnerDashboard: OwnerDashboard,
    
    StripeCallback: StripeCallback,
    
    CalendarCallback: CalendarCallback,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    // Handle kebab-case URLs (e.g., "boat-details" -> "BoatDetails")
    const normalizedUrl = urlLastPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s/g, '');
    
    const pageName = Object.keys(PAGES).find(page => page === normalizedUrl);
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/home" element={<Home />} />
                
                <Route path="/search" element={<Search />} />
                
                <Route path="/list-boat" element={<ListBoat />} />
                
                <Route path="/boat-details" element={<BoatDetails />} />
                
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                
                {/* Protected Routes - Add these later */}
                <Route path="/my-boats" element={<MyBoats />} />
                
                <Route path="/admin" element={<Admin />} />
                
                <Route path="/booking" element={<BookingPage />} />
                
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                
                <Route path="/my-bookings" element={<MyBookings />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/owner-booking-management" element={<OwnerBookingManagement />} />
                
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                
                <Route path="/stripe-callback" element={<StripeCallback />} />
                
                <Route path="/calendar-callback" element={<CalendarCallback />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}