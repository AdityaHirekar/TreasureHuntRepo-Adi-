const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function list() {
    const { data, error } = await supabase.from('location').select('location_code, location_name');
    if (error) console.error(error);
    else console.log("CURRENT LOCATIONS:", JSON.stringify(data, null, 2));
}

list();
