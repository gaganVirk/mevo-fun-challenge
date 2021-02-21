import "./App.css";
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  Polygon
} from "react-google-maps";
import React, { useState, useEffect, useRef } from "react";

function Map() {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    Promise.all(
      [
        "https://api.mevo.co.nz/public/vehicles/all",
        "https://api.mevo.co.nz/public/home-zones/all"
      ].map((url) => fetch(url).then((res) => res.json()))
    ).then(
      ([markers, geoJSON]) => {
        setIsLoaded(true);
        setItems(markers);
        setZones(
          geoJSON.data.geometry.coordinates.map((zone) =>
            zone.map(([lng, lat]) => ({ lat, lng }))
          )
        );
      },

      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    );
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <GoogleMap
        ref={mapRef}
        zoom={zoom}
        defaultCenter={{ lat: -41.292757, lng: 174.790984 }}
      >
        {items.map((item, i) => (
          <Marker
            key={i}
            icon={{
              url: item.iconUrl,
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            position={{
              lat: parseFloat(item.position.latitude),
              lng: parseFloat(item.position.longitude)
            }}
            onClick={(marker) => {
              mapRef.current.panTo(
                new window.google.maps.LatLng(
                  marker.latLng.lat(),
                  marker.latLng.lng()
                )
              );
              setZoom(16);
            }}
          />
        ))}

        {zones.map((zone, i) => (
          <Polygon
            key={i}
            path={zone}
            options={{
              strokeColor: "#fc1e0d",
              strokeOpacity: 1,
              strokeWeight: 2,
              icons: [
                {
                  icon: "hello",
                  offset: "0",
                  repeat: "10px"
                }
              ]
            }}
          />
        ))}
      </GoogleMap>
    );
  }
}
const WrappedMap = withScriptjs(withGoogleMap(Map));

export default function App() {
 return (
   <div className="header">
   <div className="map" style={{ width: '100vw', height: '100vh'}}>
    <WrappedMap googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${
      process.env.REACT_APP_GOOGLE_KEY
    }`}
    loadingElement={<div style={{ height: "100%" }} />}
    containerElement={<div style={{ height: "100%" }} />}
    mapElement={<div style={{ height: "100%" }} />}
    />
  </div>
  </div>
  );
};