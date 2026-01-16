const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data: dummy } = await supabase.from('location').select('*').eq('location_code', 'DUMMY');
    const { data: comp } = await supabase.from('location').select('*').eq('location_code', 'COMPLETED');

    console.log("Check Results:");
    console.log("DUMMY Present:", dummy.length > 0);
    console.log("COMPLETED Present:", comp.length > 0);
}

check();
