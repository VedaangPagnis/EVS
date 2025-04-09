# 🌍 Real time Air Quality Visualization App
This project visualizes real-time Air Quality Index (AQI) data using [CesiumJS](https://cesium.com/platform/cesiumjs/) and OpenWeatherMap API.  
You can click anywhere on the 3D globe or search to get the AQI and pollutant breakdown for that location.  
There are multiple location view modes (street view, night view, 2d map etc.), all provided by Cesium.  
- The **AQI values** are based on the **European Environment Agency (EEA)** scale: 1 - 5.

## Motivation
Air quality levels in most of India have reached hazardous levels and yet, due to lack of awareness of potential dangers and ignorance of the general public, it has not been acknowledged as a threat to livelihood. This is a contribution to society so that while we cannot make a change in the environment and the system that destroys it, we can encourage users to take personal measures.
## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript, CesiumJS
- **Backend**: Node.js, Express
- **API**: OpenWeatherMap (Reverse Geocoding + AQI)

# To run locally:  
- Clone the repository
```bash
git clone https://github.com/ayaanshk/EVS-ayaanshk.git
cd EVS-ayaanshk
```
- Backend setup
```bash
node server.js
```
- Frontend setup
```bash
npm install
npm start
```  

That’s a wrap!
Now go explore the globe ( •_•)>⌐■-■
