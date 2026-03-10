
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- AUDIT REPORT ---');

    const leads = await supabase.from('institutional_leads').select('*');
    console.log('institutional_leads count:', leads.data?.length || 0);
    console.log('institutional_leads data:', leads.data);

    const subs = await supabase.from('subscribers').select('*');
    console.log('subscribers count:', subs.data?.length || 0);
    console.log('subscribers data:', subs.data);

    const oldWaitlist = await supabase.from('waitlist').select('*');
    console.log('waitlist (old) count:', oldWaitlist.data?.length || 0);
    console.log('waitlist (old) data:', oldWaitlist.data);

    const apply = await supabase.from('brand_applications').select('*');
    console.log('brand_applications count:', apply.data?.length || 0);
}

run();
