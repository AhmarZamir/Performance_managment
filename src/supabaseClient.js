import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lfmeykdmzmciowblltvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmbWV5a2Rtem1jaW93YmxsdHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzA0NTEsImV4cCI6MjA3NjU0NjQ1MX0.cr5GDldpAXAYrg-X7gy45n7JVR87Ix3133ewdWgLR9g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
