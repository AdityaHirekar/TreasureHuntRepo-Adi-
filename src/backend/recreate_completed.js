const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function restore() {
    console.log("Restoring COMPLETED location...");

    const { data, error } = await supabase.from('location').insert([
        {
            location_code: 'COMPLETED',
            location_name: 'Treasure Hunt HQ',
            location_hint: 'Congratulations! Return to the start point to claim your prize.'
            // Add lat/long if your schema requires it, but usually optional for this special placeholder
        }
    ]).select();

    if (error) {
        if (error.code === '23505') console.log("COMPLETED location already exists.");
        else console.error("Error inserting COMPLETED:", error);
    } else {
        console.log("Success! Restored COMPLETED location:", data);
    }
}

restore();
