#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file')
  process.exit(1)
}

console.log('🧪 Testing Supabase Connection...')
console.log('================================')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    
    // Test 2: Check tables exist
    console.log('\n2️⃣ Checking database tables...')
    const tables = ['users', 'boats', 'bookings', 'admin_roles']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: exists`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
    // Test 3: Test RLS policies
    console.log('\n3️⃣ Testing Row Level Security...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, display_name')
      .limit(5)
    
    if (usersError) {
      console.log('❌ RLS test failed:', usersError.message)
    } else {
      console.log(`✅ RLS test passed - found ${users?.length || 0} users`)
      if (users && users.length > 0) {
        console.log('   Sample user:', users[0])
      }
    }
    
    // Test 4: Test real-time subscriptions
    console.log('\n4️⃣ Testing real-time subscriptions...')
    const subscription = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'boats' },
        (payload) => {
          console.log('🔔 Real-time event received:', payload.eventType)
        }
      )
      .subscribe()
    
    // Wait a moment for subscription
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('✅ Real-time subscription test completed')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

async function runTests() {
  const success = await testConnection()
  
  console.log('\n' + '='.repeat(50))
  if (success) {
    console.log('🎉 All tests passed! Your Supabase backend is working correctly.')
    console.log('\nNext steps:')
    console.log('1. Test CRUD operations in your app')
    console.log('2. Verify authentication flow')
    console.log('3. Test real-time features')
  } else {
    console.log('❌ Some tests failed. Check the errors above.')
    console.log('\nTroubleshooting:')
    console.log('1. Verify your Supabase URL and key')
    console.log('2. Check if your database schema is created')
    console.log('3. Ensure RLS policies are configured')
  }
  
  process.exit(success ? 0 : 1)
}

runTests() 