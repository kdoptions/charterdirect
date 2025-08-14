import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // Get boats with filters
  async getBoats(filters = {}) {
    let query = supabase
      .from('boats')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.id) {
      query = query.eq('id', filters.id)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get bookings with filters
  async getBookings(filters = {}) {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters.boat_id) {
      query = query.eq('boat_id', filters.boat_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
} 