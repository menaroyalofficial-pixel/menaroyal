
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkdagjghexpqlnkArvxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZGFnamdoZXhwcWxua2Fydnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzAxMzksImV4cCI6MjA4NjIwNjEzOX0.XfqE8E49Y1-NK7NuisN0rBMTSa_YhTKGkftzP9ldAjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: tables, error: tablesErr } = await supabase.rpc('get_tables');
    if (tablesErr) {
        console.error('RPC get_tables failed. Trying query approach.');
        const { data, error } = await supabase.from('institutional_leads').select('*');
        console.log('institutional_leads:', data);
    } else {
        console.log('Tables:', tables);
    }
}

run();
