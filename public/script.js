
let map;
let busMarkers = {};
let stopMarkers = [];

let lastAlert = 0;
let followBusId = null;

const stops = [
    { lng: 106.823983, lat: -6.371168, title: "Halte PNJ" },
    { lng: 106.831581, lat: -6.360951, title: "Halte St. UI" },
    { lng: 106.831678, lat: -6.368193, title: "Halte Pondok Cina" },
    { lng: 106.831739, lat: -6.353486, title: "Halte Menwa" }
];

const rutePagi = [[106.8244267, -6.3716528], [106.8240628, -6.3716668], [106.8240086, -6.3716295], [106.8239791, -6.3713856], [106.8239630, -6.3711257], [106.8239496, -6.3706006], [106.8239282, -6.3702501], [106.8241951, -6.3702314], [106.8240341, -6.3669487], [106.8230766, -6.3669273], [106.8229519, -6.3669287], [106.8226503, -6.3668775], [106.8223862, -6.3667403], [106.8217141, -6.3661350], [106.8215308, -6.3659039], [106.8214519, -6.3657452], [106.8214421, -6.3657178], [106.8214322, -6.3654435], [106.8215229, -6.3652281], [106.8225807, -6.3618136], [106.8226776, -6.3615662], [106.8230057, -6.3605616], [106.8264648, -6.3492952], [106.8266296, -6.3488812], [106.8267905, -6.3486458], [106.8269906, -6.3485041], [106.8276298, -6.3481842], [106.8278114, -6.3481271], [106.8281471, -6.3481248], [106.8313206, -6.3486865], [106.8316126, -6.3488122], [106.8317966, -6.3489965], [106.8318952, -6.3491492], [106.8319426, -6.3493999], [106.8319142, -6.3495865], [106.8315495, -6.3511887], [106.8315495, -6.3513521], [106.8316972, -6.3517788], [106.8318143, -6.3520115], [106.8319230, -6.3524132], [106.8319007, -6.3530143], [106.8316665, -6.3541391], [106.8315857, -6.3543331], [106.8303480, -6.3559039], [106.8302616, -6.3560673], [106.8302031, -6.3562291], [106.8301917, -6.3565401], [106.8302221, -6.3567380], [106.8302752, -6.3568832], [106.8303928, -6.3570585], [106.8311691, -6.3580625], [106.8312127, -6.3582057], [106.8318314, -6.3621962], [106.8318883, -6.3626863], [106.8319661, -6.3632066], [106.8321481, -6.3641377], [106.8321861, -6.3644638], [106.8321937, -6.3647861], [106.8321387, -6.3676550], [106.8321007, -6.3678076], [106.8312150, -6.3687030], [106.8310993, -6.3688481], [106.8310462, -6.3691176], [106.8310007, -6.3698961], [106.8309798, -6.3705087], [106.8309191, -6.3707632], [106.8307712, -6.3710139], [106.8305588, -6.3712382], [106.8298931, -6.3716453], [106.8297224, -6.3716736], [106.8285711, -6.3716415], [106.8277765, -6.3716283], [106.8275470, -6.3715812], [106.8272264, -6.3713607], [106.8253298, -6.3693231], [106.8250984, -6.3690272], [106.8250226, -6.3687520], [106.8249922, -6.3685428], [106.8249790, -6.3672346], [106.8249562, -6.3671441], [106.8248064, -6.3670009], [106.8246243, -6.3669293], [106.8241995, -6.3669349], [106.8242222, -6.3677341], [106.8243683, -6.3706105], [106.8244157, -6.3706783], [106.8244176, -6.3711024], [106.8244100, -6.3713663], [106.8244308, -6.3716547]];
const ruteSore = [[106.831697, -6.351814], [106.831863, -6.352137], [106.83192, -6.352489], [106.831879, -6.352952], [106.831673, -6.354154], [106.830275, -6.355982], [106.830157, -6.356449], [106.830284, -6.356934], [106.831209, -6.358163], [106.831871, -6.362697], [106.831955, -6.363241], [106.832169, -6.364361], [106.83218, -6.364643], [106.832126, -6.367669], [106.832097, -6.367791], [106.832024, -6.367906], [106.831142, -6.36877], [106.831072, -6.368884], [106.830954, -6.370622], [106.8309, -6.370801], [106.830509, -6.371273], [106.829755, -6.371675], [106.827644, -6.371609], [106.827234, -6.371366], [106.825107, -6.369023], [106.825008, -6.368711], [106.824992, -6.367202], [106.824868, -6.367021], [106.824643, -6.366925], [106.824187, -6.366933], [106.824361, -6.370596], [106.824404, -6.370686], [106.824423, -6.371635], [106.824062, -6.371653], [106.824007, -6.371604], [106.823978, -6.371159], [106.823978, -6.371159], [106.823942, -6.370263], [106.824207, -6.370237], [106.824042, -6.366937], [106.822922, -6.366918], [106.822439, -6.36677], [106.821538, -6.365893], [106.821445, -6.36546], [106.821978, -6.36384], [106.822061, -6.363858], [106.821599, -6.365354], [106.821573, -6.365646], [106.82167, -6.365879], [106.822449, -6.366674], [106.822984, -6.366843], [106.824922, -6.36686], [106.825128, -6.367109], [106.825088, -6.368654], [106.825182, -6.368965], [106.827334, -6.37131], [106.827731, -6.371536], [106.829861, -6.371583], [106.829861, -6.371206], [106.830775, -6.370821], [106.830884, -6.370522], [106.830933, -6.369008], [106.831022, -6.368784], [106.831985, -6.367819], [106.832055, -6.367664], [106.832105, -6.364487], [106.831961, -6.363674], [106.831781, -6.363386], [106.831666, -6.36301], [106.831655, -6.362749], [106.831768, -6.36241], [106.831079, -6.358165], [106.831009, -6.357987], [106.830148, -6.356843], [106.830076, -6.356521], [106.830124, -6.356134], [106.830258, -6.355881], [106.831477, -6.354294], [106.831595, -6.354008], [106.831837, -6.352601], [106.831831, -6.352337], [106.831649, -6.351833], [106.831697, -6.351814]];

const bounds = new maplibregl.LngLatBounds();
rutePagi.forEach(c => bounds.extend(c));
ruteSore.forEach(c => bounds.extend(c));

function initMap() {
    const styleUrl = 'https://tiles.openfreemap.org/styles/bright';

    map = new maplibregl.Map({
        container: 'map',
        style: styleUrl,
        bounds: bounds,
        fitBoundsOptions: { padding: { top: 20, bottom: 180, left: 10, right: 10 } },
        pitch: 0,
        bearing: 0,
        antialias: true
    });

    map.on('load', () => {
        addRoutes();
        try { add3DBuildings(); } catch (e) { console.error("3D Buildings error", e); }
        addStops();

        document.getElementById('skeleton-loader').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('hidden');

        fetchData();
        setInterval(fetchData, 3000);

        map.on('dragstart', () => { followBusId = null; });
        map.on('touchmove', () => { followBusId = null; });
    });

    setupControls();
}

function addRoutes() {
    if (!map.getSource('rutePagi')) {
        map.addSource('rutePagi', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: rutePagi } } });
        map.addLayer({
            id: 'rutePagiLayer', type: 'line', source: 'rutePagi',
            layout: { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'visible' },
            paint: { 'line-color': '#BF1E2E', 'line-width': 5, 'line-opacity': 0.8 }
        });
    }

    if (!map.getSource('ruteSore')) {
        map.addSource('ruteSore', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ruteSore } } });
        map.addLayer({
            id: 'ruteSoreLayer', type: 'line', source: 'ruteSore',
            layout: { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'visible' },
            paint: { 'line-color': '#159BB3', 'line-width': 5, 'line-opacity': 0.8 }
        });
    }

    document.querySelectorAll('.chip').forEach(el => el.classList.add('active-route'));
}

function toggleRoute(layerIdObj, element) {
    if (!map) return;
    const layerId = layerIdObj + 'Layer';
    const visibility = map.getLayoutProperty(layerId, 'visibility');

    if (visibility === 'visible' || visibility === undefined) {
        map.setLayoutProperty(layerId, 'visibility', 'none');
        element.classList.remove('active-route');
        element.querySelector('i').className = 'fa-solid fa-xmark';
    } else {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
        element.classList.add('active-route');
        element.querySelector('i').className = 'fa-solid fa-check';
    }
}

function addStops() {
    stopMarkers.forEach(m => m.remove());
    stopMarkers = [];
    stops.forEach(stop => {
        const el = document.createElement('div');
        el.style.backgroundImage = "url('https://png.pngtree.com/png-clipart/20230321/original/pngtree-bus-stop-vector-icon-design-illustration-png-image_8997806.png')";
        el.style.width = '30px'; el.style.height = '30px';
        el.style.backgroundSize = 'contain'; el.style.backgroundRepeat = 'no-repeat';

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([stop.lng, stop.lat])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setText(stop.title))
            .addTo(map);
        stopMarkers.push(marker);
    });
}

function add3DBuildings() {
    const style = map.getStyle();
    if (!style || !style.sources) return;
    const vectorSource = Object.keys(style.sources).find(key => style.sources[key].type === 'vector');

    if (vectorSource && !map.getLayer('add-3d-buildings')) {
        map.addLayer({
            'id': 'add-3d-buildings',
            'source': vectorSource,
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 14,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['coalesce', ['get', 'height'], 0],
                'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                'fill-extrusion-opacity': 0.6
            }
        });
    }
}

function setupControls() {
    document.getElementById('recenterBtn').onclick = () => {
        followBusId = null;
        map.fitBounds(bounds, { padding: { top: 20, bottom: 180, left: 10, right: 10 }, pitch: 0, bearing: 0 });
    };
}

async function fetchData() {
    try {
        const res = await fetch('/api/bus/location');
        const json = await res.json();
        const data = json.data || [];

        const list = document.getElementById('bus-list');
        const skeleton = document.getElementById('skeleton-loader');
        const emptyState = document.getElementById('empty-state');

        skeleton.classList.add('hidden');

        if (data.length === 0) {
            emptyState.classList.remove('hidden');
            Array.from(list.children).forEach(c => {
                if (!c.classList.contains('skeleton-loader') && !c.classList.contains('empty-state')) c.remove();
            });
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        Array.from(list.children).forEach(c => {
            if (!c.classList.contains('skeleton-loader') && !c.classList.contains('empty-state')) c.remove();
        });

        const activeIds = new Set();
        data.forEach(bus => {
            activeIds.add(bus.bus_id);
            updateMarker(bus);
            updateSidebar(bus, list);
            calculateETA(bus);
            checkAlerts(bus);

            if (followBusId === bus.bus_id) {
                map.flyTo({ center: [bus.longitude, bus.latitude], speed: 0.5 });
            }
        });

        Object.keys(busMarkers).forEach(id => {
            if (!activeIds.has(id)) {
                busMarkers[id].remove();
                delete busMarkers[id];
            }
        });
    } catch (e) { console.error(e); }
}

function updateMarker(bus) {
    const pos = [bus.longitude, bus.latitude];
    const content = `<div class="iw-header"><img src="./images/bipol.png" class="iw-icon"><h3>${bus.bus_id}</h3></div><p>Speed: ${bus.speed} km/h<br>Gas: ${bus.gas_level}</p>`;

    if (busMarkers[bus.bus_id]) {
        busMarkers[bus.bus_id].setLngLat(pos);
        busMarkers[bus.bus_id].getPopup().setHTML(content);
    } else {
        const el = document.createElement('div');
        el.className = 'bus-marker-icon';
        el.style.backgroundImage = 'url(/images/bipol.png)';
        el.style.width = '48px';
        el.style.height = '48px';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.cursor = 'pointer';

        const pulse = document.createElement('div');
        pulse.className = 'marker-pulse';
        el.appendChild(pulse);

        el.onclick = () => {
            followBusId = bus.bus_id;
            map.flyTo({ center: pos, zoom: 17 });
        };

        busMarkers[bus.bus_id] = new maplibregl.Marker({ element: el })
            .setLngLat(pos)
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(content))
            .addTo(map);
    }
}

function updateSidebar(bus, list) {
    const item = document.createElement('div');
    item.className = 'bus-item';
    if (followBusId === bus.bus_id) item.classList.add('active-focus');

    let statusDot = bus.speed < 1 ? 'dot-gray' : 'dot-green';
    if (bus.gas_level > 250) statusDot = 'dot-red';

    item.innerHTML = `
        <div class="bus-icon-wrapper"><img src="./images/bipol.png"></div>
        <div class="bus-info">
            <h4>${bus.bus_id} <span class="status-dot ${statusDot}"></span></h4>
            <p><span><i class="fa-solid fa-gauge"></i> ${bus.speed} km/h</span> &bull; <span><i class="fa-solid fa-fire"></i> ${bus.gas_level}</span></p>
        </div>`;

    item.onclick = () => {
        followBusId = bus.bus_id;
        map.flyTo({ center: [bus.longitude, bus.latitude], zoom: 17.5, speed: 1.2 });
        document.querySelectorAll('.bus-item').forEach(i => i.classList.remove('active-focus'));
        item.classList.add('active-focus');
    };
    list.appendChild(item);
}

function calculateETA(bus) {
    const from = turf.point([bus.longitude, bus.latitude]);
    let minDist = Infinity;
    let nearestStop = '';
    stops.forEach(stop => {
        const to = turf.point([stop.lng, stop.lat]);
        const dist = turf.distance(from, to, { units: 'kilometers' });
        if (dist < minDist) { minDist = dist; nearestStop = stop.title; }
    });
    const etaEl = document.getElementById('eta-display');
    const displaySpeed = (bus.speed && bus.speed > 1) ? bus.speed : 20;

    if (minDist < 0.05) {
        etaEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Tiba di ${nearestStop}`;
        etaEl.classList.remove('hidden');
    } else {
        const time = Math.ceil((minDist / displaySpeed) * 60);
        etaEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${time} min ke ${nearestStop}`;
        etaEl.classList.remove('hidden');
    }
}

function checkAlerts(bus) {
    if (bus.gas_level > 250 && Date.now() - lastAlert > 30000) {
        Swal.fire({ icon: 'warning', title: 'BAHAYA!', text: `Gas Tinggi: ${bus.gas_level}`, timer: 5000, background: '#BF1E2E', color: '#fff' });
        lastAlert = Date.now();
    }
}

initMap();

function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    const sheet = document.querySelector('.bottom-sheet');

    if (tab === 'home') {
        sheet.classList.remove('hidden');
        map.flyTo({ padding: { bottom: 200 } });
    } else if (tab === 'map') {
        sheet.classList.add('hidden');
        map.flyTo({ padding: { bottom: 0 } });

        map.fitBounds(bounds, { padding: 50 });
    } else if (tab === 'announcement') {
        Swal.fire({
            title: 'Pengumuman',
            html: '<div style="text-align:left"><p>📢 <b>Jadwal Baru:</b><br>Mulai 1 Januari 2025, jadwal bus Bipol diperpanjang hingga pukul 20:00 WIB.</p><hr><p>🚧 <b>Info Lalu Lintas:</b><br>Jalan Margonda sedang ada perbaikan, harap maklum jika ada keterlambatan.</p></div>',
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#BF1E2E'
        });
    }
}