require('dotenv').config();
const keys = Object.keys(process.env).filter(k => k.startsWith('SUPABASE_'));
console.log("Found SUPABASE keys:", keys);
