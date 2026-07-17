import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://vxjgiafzkftkwnlrcwzg.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4amdpYWZ6a2Z0a3dubHJjd3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTI5NDgsImV4cCI6MjA5ODg2ODk0OH0.VXJMLAYz0axH8haLHZkC9JxZPs4gSbg3BkAC-bnawpU"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)