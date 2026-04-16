import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://azsoeojudsvwnursynfa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c29lb2p1ZHN2d251cnN5bmZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3MTAxOCwiZXhwIjoyMDkxOTQ3MDE4fQ.KS4jERBXs9YQYSG5ycDy8w_CNYgzFL3sv--_9Fs0-98';

export const supabase = createClient(supabaseUrl, supabaseKey);
