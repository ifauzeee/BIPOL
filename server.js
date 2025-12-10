require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERROR: Config .env belum lengkap!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function getLogTime() {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Jakarta'
    });
}

app.post('/api/track', async (req, res) => {
    const bus_id = req.body.bus_id;
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);
    const speed = parseFloat(req.body.speed);
    const gas_level = parseInt(req.body.gas_level);

    if (!bus_id) return res.status(400).send("Data invalid");

    console.log(`\n==================================================`);
    console.log(`📅 ${getLogTime()}`);
    console.log(`🚌 ${bus_id}  |  📍 ${latitude}, ${longitude}`);
    console.log(`⛽ Gas: ${gas_level}  |  🚀 Speed: ${speed} km/h`);
    console.log(`==================================================`);

    const insertData = {
        bus_id,
        latitude,
        longitude,
        speed,
        gas_level,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('bipol_tracker')
        .insert([insertData])
        .select();

    if (error) {
        console.error(`❌ [${getLogTime()}] DB Insert ERROR:`, error.message);
        if (error.cause) console.error("Cause:", error.cause);
        return res.status(500).send("DB Error");
    }

    console.log(`✅ [${getLogTime()}] Saved to DB (ID: ${data[0].id})`);
    res.status(200).send("OK");
});

app.get('/api/bus/location', async (req, res) => {
    const { data, error } = await supabase
        .from('bipol_tracker')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) return res.status(500).json({ error: error.message });

    const latest = {};
    data.forEach(d => { if (!latest[d.bus_id]) latest[d.bus_id] = d; });

    res.json({ data: Object.values(latest) });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server HIDUP di Port ${PORT}`);
});
