const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fixAndNuke() {
    console.log("Fixing Foreign Keys...");
    // 1. Move any team at 'DUMMY' to 'COMPLETED'
    const { error: moveErr } = await supabase.from('teams').update({ assigned_location: 'COMPLETED' }).eq('assigned_location', 'DUMMY');
    if (moveErr) console.error("Move Error:", moveErr);
    else console.log("Moved teams away from DUMMY.");

    // 2. Delete DUMMY
    console.log("Deleting DUMMY...");
    const { error: delErr } = await supabase.from('location').delete().eq('location_code', 'DUMMY');
    if (delErr) console.error("Delete Error:", delErr);
    else console.log("Success: DUMMY Deleted.");
}

fixAndNuke();
