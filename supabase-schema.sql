-- Harbour Lux Database Schema
-- Run this in your Supabase SQL Editor

-- Create custom types
CREATE TYPE boat_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending_approval', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'deposit_paid', 'paid', 'failed', 'refunded');
CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boats table
CREATE TABLE public.boats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    boat_type TEXT NOT NULL,
    with_captain BOOLEAN DEFAULT true,
    max_guests INTEGER NOT NULL,
    location TEXT NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    weekend_price DECIMAL(10,2),
    extended_booking_price DECIMAL(10,2),
    off_season_discount INTEGER DEFAULT 0,
    early_bird_discount INTEGER DEFAULT 0,
    early_bird_days INTEGER DEFAULT 14,
    down_payment_percentage INTEGER DEFAULT 30,
    balance_payment_days_before INTEGER DEFAULT 7,
    payment_schedule_enabled BOOLEAN DEFAULT true,
    images TEXT[],
    additional_media TEXT[],
    amenities TEXT[],
    additional_services TEXT[],
    availability_blocks JSONB,
    special_pricing JSONB,
    terms_and_conditions TEXT,
    cancellation_policy TEXT,
    stripe_account_id TEXT,
    status boat_status DEFAULT 'pending',
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    owner_email TEXT NOT NULL,
    owner_name TEXT,
    business_name TEXT,
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    boat_id UUID REFERENCES public.boats(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE,
    end_datetime TIMESTAMP WITH TIME ZONE,
    start_time TIME,
    end_time TIME,
    is_custom_time BOOLEAN DEFAULT false,
    guests INTEGER NOT NULL,
    total_hours INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    additional_services JSONB,
    total_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    down_payment DECIMAL(10,2) NOT NULL,
    remaining_balance DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending_approval',
    payment_status payment_status DEFAULT 'pending',
    payment_method JSONB,
    payment_details JSONB,
    special_requests TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    booking_reference TEXT UNIQUE NOT NULL,
    platform_fee_collected DECIMAL(10,2),
    deposit_paid_at TIMESTAMP WITH TIME ZONE,
    payment_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin roles table
CREATE TABLE public.admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_boats_owner_id ON public.boats(owner_id);
CREATE INDEX idx_boats_status ON public.boats(status);
CREATE INDEX idx_boats_location ON public.boats(location);
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_boat_id ON public.bookings(boat_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for boats
CREATE POLICY "Anyone can view approved boats" ON public.boats
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can view their own boats" ON public.boats
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all boats" ON public.boats
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Owners can insert their own boats" ON public.boats
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own boats" ON public.boats
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Admins can update any boat" ON public.boats
    FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for bookings
CREATE POLICY "Customers can view their own bookings" ON public.bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Boat owners can view bookings for their boats" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.boats 
            WHERE id = boat_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Boat owners can update bookings for their boats" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.boats 
            WHERE id = boat_id AND owner_id = auth.uid()
        )
    );

-- Function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin_roles
CREATE POLICY "Only admins can view admin roles" ON public.admin_roles
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage admin roles" ON public.admin_roles
    FOR ALL USING (is_admin(auth.uid()));

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boats_updated_at BEFORE UPDATE ON public.boats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 