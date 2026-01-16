const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function nuke() {
    console.log("Nuking DUMMY...");
    const { count, error } = await supabase.from('location').delete().eq('location_code', 'DUMMY').select();

    if (error) console.error("Error:", error);
    else console.log("Deleted count:", count); // Note: count might be null depending on select() use, but 'data' returns rows

    // double check
    const { data } = await supabase.from('location').select('*').eq('location_code', 'DUMMY');
    console.log("Remaining DUMMY:", data.length);
}

nuke();
