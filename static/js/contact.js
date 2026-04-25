const mapContainer = document.getElementById('map');
let storeAddresses = [];
let map;
let userLocation = null;

if (typeof mapboxgl !== 'undefined' && mapContainer) {
    mapboxgl.accessToken = '';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        projection: 'mercator',
        zoom: 1,
        center: [30, 15]
    });

    const geo = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
    });

    geo.on('geolocate', (event) => {
        userLocation = [event.coords.longitude, event.coords.latitude];
    });

    map.addControl(geo);
    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();

    map.on('load', () => {
        map.scrollZoom.enable();
        geo.trigger();
        setRouteSource();
        setStoreLocation();
    });
} else {
    console.error('Mapbox cannot initialize: missing library or #map container.');
}

function setRouteSource() {
    if (!map.getSource('route')) {
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3b82f6',
                'line-width': 6,
                'line-opacity': 0.9
            }
        });
    }
}

function renderStoreList() {
    const storeListContainer = document.getElementById('storeList');
    if (!storeListContainer) return;

    if (storeAddresses.length === 0) {
        storeListContainer.innerHTML = '<tr><td colspan="2" class="text-center">Không có cửa hàng nào</td></tr>';
        return;
    }

    storeListContainer.innerHTML = storeAddresses.map(store => `
        <tr>
            <td><strong>${store.name}</strong></td>
            <td>${store.address}</td>
        </tr>
    `).join('');
}


function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (userLocation) {
            return resolve(userLocation);
        }

        if (!navigator.geolocation) {
            return reject(new Error('Geolocation not supported by browser'));
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.longitude, position.coords.latitude];
                resolve(userLocation);
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

async function showRouteTo(destination) {
    try {
        const origin = await getCurrentLocation();

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error('Không tìm thấy tuyến đường');
        }

        const routeGeoJSON = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry
            }]
        };

        const routeSource = map.getSource('route');
        if (routeSource) {
            routeSource.setData(routeGeoJSON);
        }

        const bounds = data.routes[0].geometry.coordinates.reduce(
            (b, coord) => b.extend(coord),
            new mapboxgl.LngLatBounds(origin, origin)
        );

        map.fitBounds(bounds, {
            padding: 100,
            maxZoom: 14
        });
    } catch (err) {
        console.warn('Chỉ đường thất bại:', err);
        alert('Không thể lấy chỉ đường từ vị trí hiện tại. Vui lòng bật định vị và thử lại.');
    }
}

function setStoreLocation() {
    $.ajax({
        url: "http://127.0.0.1:5000/store/getAll",
        method: "GET",
        contentType: "application/json",
        success: async function (res) {
            storeAddresses = res;
            console.log('storeAddresses', storeAddresses);

            for (const s of storeAddresses) {
                let lat = s.lat;
                let lng = s.lng;

                if (lat == null || lng == null) {
                    try {
                        const geoResult = await geocode(s.address);
                        lat = geoResult.lat;
                        lng = geoResult.lng;

                        await $.ajax({
                            url: "http://127.0.0.1:5000/store/updateLocation",
                            contentType: "application/json",
                            method: "PUT",
                            data: JSON.stringify({
                                lat,
                                lng,
                                id: s.id
                            }),
                            dataType: 'json',
                            error: function (err) {
                                console.warn("Error while updating store location", err);
                            }
                        });
                    } catch (err) {
                        console.warn("Geocoding failed for address:", s.address, err);
                    }
                }

                if (lat != null && lng != null) {
                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div class="popup">
                                <div class="title">${s.name}</div>
                                <div class="address">${s.address}</div>
                                <div class="route-hint">Nhấn marker để chỉ đường</div>
                            </div>
                        `);

                    const marker = new mapboxgl.Marker({ color: '#dc2626' })
                        .setLngLat([lng, lat])
                        .setPopup(popup)
                        .addTo(map);

                    marker.getElement().addEventListener('click', () => {
                        showRouteTo([lng, lat]);
                    });
                }
            }
            renderStoreList();
        },
        error: function (e) {
            alert("get stores addresses failed");
        }
    });
}

async function geocode(address) {
    const accessToken = mapboxgl.accessToken;

    const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`
    );

    const data = await res.json();

    if (!data.features || data.features.length === 0) {
        throw new Error('No geocoding result for address: ' + address);
    }

    const [lng, lat] = data.features[0].center;
    return { lat, lng };
}
