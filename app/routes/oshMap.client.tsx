import {
  MapContainer,
  Marker,
  Popup,
  GeoJSON,
  TileLayer,
  MapContainerProps,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const center: MapContainerProps["center"] = [43.99, -88.551];

// Import marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-88.556, 44.02],
            [-88.56, 44.018],
            [-88.564, 44.022],
            [-88.556, 44.02],
          ],
        ],
      },
      properties: {
        notamNumber: "OSH01/001",
        icaoLocation: "KOSH",
        notamType: "N",
        classification: "DOM",
        description: "Temporary flight restriction in effect.",
      },
    },
  ],
};

const MapWrapper = () => {
  return (
    <MapContainer
      style={{ height: "85%" }}
      center={center}
      zoom={13}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={geojsonData} />
      <Marker position={center}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapWrapper;
