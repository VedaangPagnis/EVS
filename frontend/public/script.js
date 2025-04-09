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

        // DOM Elements
        const infoPane = document.getElementById("infoPane");
        const latText = document.getElementById("latText");
        const lonText = document.getElementById("lonText");
        const aqiText = document.getElementById("aqiText");
        const componentsList = document.getElementById("componentsList");
        const placeName = document.getElementById("placeName");
        const closeBtn = document.getElementById("closeBtn");
        const backdrop = document.getElementById("backdrop");
        const themeToggle = document.getElementById("themeToggle");

        // Theme Management
        function toggleTheme() {
            const currentTheme = infoPane.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            infoPane.setAttribute('data-theme', newTheme);
            localStorage.setItem('infoPaneTheme', newTheme);
            updateThemeIcon(newTheme);
        }

        function updateThemeIcon(theme) {
            themeToggle.textContent = theme === 'dark' ? '🌞' : '🌙';
        }

        function initializeTheme() {
            const savedTheme = localStorage.getItem('infoPaneTheme') || 'light';
            infoPane.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        // Event Listener
        themeToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling to backdrop
            toggleTheme();
        });
        closeBtn.addEventListener('click', closeInfoPane);
        backdrop.addEventListener('click', closeInfoPane);

        // Initialize theme
        initializeTheme();

        // Info Pane Animation Functions
        function openInfoPane() {
            infoPane.style.display = 'block';
            backdrop.style.display = 'block';
            
            // Trigger reflow to ensure animations work
            void infoPane.offsetWidth;
            void backdrop.offsetWidth;
            
            infoPane.classList.add("show");
            backdrop.classList.add("show");
        }

        function closeInfoPane() {
            infoPane.classList.remove("show");
            backdrop.classList.remove("show");
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                infoPane.style.display = 'none';
                backdrop.style.display = 'none';
            }, 350);
        }

        // Cesium Click Handler
        viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            const pickedPosition = viewer.scene.globe.pick(
                viewer.camera.getPickRay(movement.position),
                viewer.scene
            );

            if (pickedPosition) {
                const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
                const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);

                // Update coordinates
                latText.textContent = latitude;
                lonText.textContent = longitude;

                // Fetch location name
                fetch(`http://localhost:3001/reverse-geocode?lat=${latitude}&lon=${longitude}`)
                    .then(res => res.json())
                    .then(data => {
                        placeName.textContent = data.name || "Unknown Location";
                    })
                    .catch(() => {
                        placeName.textContent = "Unknown Location";
                    });

                // Fetch AQI Data
                fetch('http://localhost:3001/aqi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ lat: latitude, lon: longitude })
                })
                .then(res => res.json())
                .then(data => {
                    const aqiLevel = parseInt(data.aqi_level);
                    const aqiLabels = {
                        1: { label: "1 - Good", color: "#2ecc71" },
                        2: { label: "2 - Fair", color: "#f1c40f" },
                        3: { label: "3 - Moderate", color: "#e67e22" }, 
                        4: { label: "4 - Poor", color: "#e74c3c" },       
                        5: { label: "5 - Very Poor", color: "#9b59b6" },
                    };

                    if (aqiLabels[aqiLevel]) {
                        aqiText.textContent = aqiLabels[aqiLevel].label;
                        aqiText.style.color = aqiLabels[aqiLevel].color;
                    } else {
                        aqiText.textContent = "N/A";
                        aqiText.style.color = "#333";
                    }

                    componentsList.innerHTML = `
                        <div class="pollutants-list">
                            ${Object.entries(data.aqi || {}).map(([key, val]) => `
                                <div class="pollutant-item">
                                    <span class="pollutant-name">${key}</span>
                                    <span class="pollutant-value">${val} µg/m³</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    
                    openInfoPane();
                })
                .catch(err => {
                    console.error("AQI Fetch Error:", err);
                    aqiText.textContent = "Error fetching AQI";
                    componentsList.innerHTML = "";
                    openInfoPane();
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    })
    .catch(error => console.error("Error fetching Cesium key:", error));