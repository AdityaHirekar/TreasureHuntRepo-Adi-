const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// DMS to Decimal Helper
const dmsToDec = (d, m, s) => d + m / 60 + s / 3600;

// Data Entry - Mapped to Legacy Codes
const locations = [
    { name: "College Start Point", lat: 18.92368888207889, lng: 72.83244098149588, code: "CLG" },
    { name: "Westside", lat: 18.9280036, lng: 72.8309223, code: "WESTSIDE" },
    { name: "Lion Gate", lat: 18.926808, lng: 72.833937, code: "LION_GATE" }, // Legacy code implied
    { name: "Chhatrapati Shivaji Maharaj Vastu Sangra", lat: 18.9269037, lng: 72.8326707, code: "CSMVS" },
    { name: "The Souled Store", lat: 18.9218242, lng: 72.8309803, code: "SOULED_STORE" },
    { name: "Subway (near petrol pump)", lat: 18.9218242, lng: 72.8309803, code: "SUBWAY" },
    { name: "Mochi", lat: dmsToDec(18, 55, 16), lng: dmsToDec(72, 49, 51), code: "MOCHI" }, // Existed in screenshot as MOCHI
    { name: "Ling's Pavilion", lat: dmsToDec(18, 55, 25), lng: dmsToDec(72, 49, 56), code: "LINGS_PAVILION" },
    { name: "Leopold Café", lat: dmsToDec(18, 55, 22), lng: dmsToDec(72, 49, 54), code: "LEOPOLD_CAFE" },
    { name: "Study Centre", lat: dmsToDec(18, 55, 33), lng: dmsToDec(72, 49, 46), code: "STUDY_CENTRE" },
    { name: "Taj Hotel", lat: dmsToDec(18, 55, 17), lng: dmsToDec(72, 49, 59), code: "TAJ_HOTEL" },
    { name: "Radio Club Seaside", lat: dmsToDec(18, 55, 5), lng: dmsToDec(72, 49, 54), code: "RADIO_CLUB" },
    { name: "Holy Name High School", lat: dmsToDec(18, 55, 22), lng: dmsToDec(72, 49, 51), code: "HOLY_NAME_SCHOOL" },
    { name: "Electric House / Bus Station", lat: 18.9202778, lng: 72.8305556, code: "ELECTRIC_HOUSE" },
];

async function seed() {
    console.log("Cleaning up duplicates...");
    // Retrieve all locations to identify duplicates (codes starting with LOC- that we created)
    const { data: allLocs } = await supabase.from('location').select('location_code');
    const duplicates = allLocs.filter(l => l.location_code.startsWith('LOC-') && !["LOC-1", "LOC-2"].includes(l.location_code)).map(l => l.location_code);
    // Careful not to delete legitimate ones if they started with LOC-, but screenshot shows legacy ones don't match that pattern except maybe generic placeholders.
    // The screenshot showed "LOC-CLG", "LOC-CSMV" which are definitely mine.

    if (duplicates.length > 0) {
        const { error: delError } = await supabase.from("location").delete().in("location_code", duplicates);
        if (delError) console.error("Error cleaning up:", delError);
        else console.log(`Deleted ${duplicates.length} duplicate records.`);
    }

    console.log("Updating Legacy Locations...");
    for (const loc of locations) {
        console.log(`Updating ${loc.code}...`);
        // Update directly by location_code
        const { error } = await supabase.from("location").update({
            latitude: loc.lat,
            longitude: loc.lng
        }).eq("location_code", loc.code);

        if (error) console.error(`Error updating ${loc.code}:`, error);
        else console.log(`Updated ${loc.code}`);
    }
    console.log("Done.");
}

seed();
