const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function clean() {
    console.log("Cleaning up locations...");

    // Delete DUMMY
    const { error: err1 } = await supabase.from('location').delete().eq('location_code', 'DUMMY');
    if (err1) console.error("Error deleting DUMMY:", err1);
    else console.log("Deleted DUMMY location.");

    // Check COMPLETED (It should stay, but we will hide it in UI)
    const { data: comp } = await supabase.from('location').select('*').eq('location_code', 'COMPLETED');
    console.log("COMPLETED location status:", comp.length > 0 ? "Exists (Required for logic)" : "Missing");
}

clean();
