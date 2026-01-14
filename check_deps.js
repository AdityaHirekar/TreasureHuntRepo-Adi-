
try {
    require("dotenv");
    console.log("dotenv: OK");
} catch (e) { console.log("dotenv: MISSING"); }

try {
    require("express");
    console.log("express: OK");
} catch (e) { console.log("express: MISSING"); }

try {
    require("cors");
    console.log("cors: OK");
} catch (e) { console.log("cors: MISSING"); }

try {
    require("body-parser");
    console.log("body-parser: OK");
} catch (e) { console.log("body-parser: MISSING"); }

try {
    require("@supabase/supabase-js");
    console.log("@supabase/supabase-js: OK");
} catch (e) { console.log("@supabase/supabase-js: MISSING"); }

try {
    require("open-location-code");
    console.log("open-location-code: OK");
} catch (e) { console.log("open-location-code: MISSING"); }
