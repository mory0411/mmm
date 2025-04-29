import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zicjvamnhebspwgvjxyc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppY2p2YW1uaGVic3B3Z3ZqeHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4ODc4MDMsImV4cCI6MjA2MTQ2MzgwM30.kKSkDHJ7dXxWpSy7aqUj2EGI0kkGJbbUSxcTfrPg8Bc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 