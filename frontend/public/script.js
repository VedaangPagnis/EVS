fetch('http://localhost:3001/cesium-key')
    .then(response => response.json())
    .then(data => {
        Cesium.Ion.defaultAccessToken = data.key;

        const viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: Cesium.createWorldTerrain(),
            animation: false,
            timeline: false
        });

        // Disable autocomplete to save geocoding credits
        viewer.geocoder.viewModel.autoComplete = false;

        const infoPane = document.getElementById("infoPane");
        const latText = document.getElementById("latText");
        const lonText = document.getElementById("lonText");
        const aqiText = document.getElementById("aqiText");
        const componentsList = document.getElementById("componentsList");
        const placeName = document.getElementById("placeName");
        const closeBtn = document.getElementById("closeBtn");

        closeBtn.addEventListener('click', () => infoPane.classList.add("hidden"));

        viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            const pickedPosition = viewer.scene.globe.pick(
                viewer.camera.getPickRay(movement.position),
                viewer.scene
            );

            if (pickedPosition) {
                const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
                const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);

                // Set coordinates in sidepane
                latText.textContent = latitude;
                lonText.textContent = longitude;

               // Fetch place name using OpenWeather's reverse geocoding (via backend)
                fetch(`http://localhost:3001/reverse-geocode?lat=${latitude}&lon=${longitude}`)
                .then(res => res.json())
                .then(data => {
                    placeName.textContent = data.name || "Unknown Location";
                })
                .catch(() => {
                    placeName.textContent = "Unknown Location";
                });

                // Call backend to get AQI
                fetch('http://localhost:3001/aqi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ lat: latitude, lon: longitude })
                })
                .then(res => res.json())
                .then(data => {
                    aqiText.textContent = data.aqi_level || "N/A";

                    componentsList.innerHTML = "<strong>Pollutants:</strong><ul>" +
                        Object.entries(data.aqi || {}).map(([key, val]) =>
                            `<li>${key}: ${val} µg/m³</li>`).join('') + "</ul>";

                    infoPane.classList.remove("hidden");
                })
                .catch(err => {
                    console.error("AQI Fetch Error:", err);
                    aqiText.textContent = "Error fetching AQI";
                    componentsList.innerHTML = "";
                    infoPane.classList.remove("hidden");
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    })
    .catch(error => console.error("Error fetching Cesium key:", error));
