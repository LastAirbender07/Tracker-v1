import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { LatLng, LeafletView } from 'react-native-leaflet-view';
import './global.js';

const MapScreen = () => {
  const [lastLocation, setLastLocation] = useState(null);

  const fetchLastLocation = async () => {
    try {
        const response = await axios.get('http://'+global.ip+':3000/getLastLocation');
        const lastLocation = response.data;
        setLastLocation(lastLocation);
        console.log('Last Location:', lastLocation);
    } catch (error) {
        console.error('Error fetching last location', error);
    }
  };

  useEffect(() => {
      fetchLastLocation();
  }, []);

  const latitude = lastLocation ? lastLocation.lat : 13.082680;
  const longitude = lastLocation ? lastLocation.long : 80.270721;
  console.log(lastLocation);

  console.log(latitude);
  console.log(longitude);

  const openStreetMapLayer = {
    baseLayerName: 'OpenStreetMap',
    baseLayerIsChecked: 'true',
    layerType: 'TileLayer',
    baseLayer: true,
    url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    tileSize: 256
  };

  const initialPosition = {
    lat: latitude,
    lng: longitude,
  };

  const marker = {
    id: '1',
    position: initialPosition,
    icon: '📍',
    size: [32, 32],
    animation: {
      duration: '0.5s',
      delay: '0s',
      iterationCount: 1,
      type: 'BOUNCE',
    },
  };

  return (
    <View style={styles.container}>
      <LeafletView
        baseLayer={openStreetMapLayer}
        mapCenterPosition={initialPosition}
        zoom={9}
        mapMarkers={[marker]}
        onMessageReceived={(event) => {
          console.log(event);
        }}
      />
      {/* {lastLocation && (
          <View>
            <Text className="text-white text-xl font-semibold mt-5">Last Latitude: {lastLocation.lat}</Text>
            <Text className="text-white text-xl font-semibold mt-5">Last Longitude: {lastLocation.long}</Text>
            <Text className="text-white text-xl font-semibold mt-5">Last Time: {lastLocation.time}</Text>
          </View>
      )} */}
    </View>

  )
}

export default MapScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});