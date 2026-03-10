
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkdagjghexpqlnkArvxu.supabase.co';
console.log('Using Supabase URL:', supabaseUrl);
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZGFnamdoZXhwcWxua2Fydnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzAxMzksImV4cCI6MjA4NjIwNjEzOX0.XfqE8E49Y1-NK7NuisN0rBMTSa_YhTKGkftzP9ldAjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- ARCHIVE AUDIT ---');

    // 1. Check Institutional Leads
    const { data: leads, error: leadsErr } = await supabase.from('institutional_leads').select('*');
    if (leadsErr) console.error('Error fetching institutional_leads:', leadsErr);
    console.log('institutional_leads Entries:', leads?.length || 0);
    console.log('institutional_leads Rows:', leads);

    // 1.5 Check Old Waitlist
    const { data: oldLeads, error: oldErr } = await supabase.from('waitlist').select('*');
    if (oldErr) console.log('Waitlist table might not exist in this project.');
    else {
        console.log('waitlist (old table) Entries:', oldLeads?.length || 0);
        console.log('waitlist (old table) Rows:', oldLeads);
    }

    // 2. Check Subscribers
    const { data: subs, error: subsErr } = await supabase.from('subscribers').select('*');
    if (subsErr) console.error('Error fetching subscribers:', subsErr);
    console.log('subscribers Entries:', subs?.length || 0);

    // 3. Try a test insert to see why it might fail
    const testEmail = 'diagnostic_' + Date.now() + '@menaroyal.com';
    console.log('Attempting diagnostic insert for:', testEmail);
    const { error: insErr } = await supabase.from('institutional_leads').insert([{
        email: testEmail,
        region: 'diagnostic',
        status: 'pending'
    }]);

    if (insErr) {
        console.error('DIAGNOSTIC INSERT FAILED:', insErr);
    } else {
        console.log('DIAGNOSTIC INSERT SUCCESSFUL.');
        // Cleanup
        await supabase.from('institutional_leads').delete().eq('email', testEmail);
    }
}

run();
