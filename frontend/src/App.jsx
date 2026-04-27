import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const socket = io("http://localhost:5000");

function App() {
  const [places, setPlaces] = useState([]);
  const [risks, setRisks] = useState([]);

  const fetchData = async () => {
    const placesRes = await axios.get("http://localhost:5000/places");
    const riskRes = await axios.get("http://localhost:5000/predict-risk");

    setPlaces(placesRes.data);
    setRisks(riskRes.data);
  };

  useEffect(() => {
    fetchData();

    socket.on("new-report", () => {
      fetchData();
    });

    return () => socket.off("new-report");
  }, []);

  const reportCrowd = async (placeId, level) => {
    await axios.post("http://localhost:5000/report", {
      placeId,
      crowdLevel: level
    });
  };

  const getRisk = (placeName) => {
    return risks.find(r => r.place === placeName);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "70vw", height: "100vh" }}>
        <MapContainer
          center={[10.9035, 76.9015]}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {places.map(place => (
            <Marker
              key={place._id}
              position={[
                place.location.coordinates[1],
                place.location.coordinates[0]
              ]}
            >
              <Popup>
                <h3>{place.name}</h3>

                <button onClick={() => reportCrowd(place._id, 1)}>Low</button>
                <button onClick={() => reportCrowd(place._id, 3)}>Medium</button>
                <button onClick={() => reportCrowd(place._id, 5)}>High</button>

                <hr />

                {getRisk(place.name) && (
                  <>
                    <p>Status: {getRisk(place.name).status}</p>
                    <p>{getRisk(place.name).recommendation}</p>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ width: "30vw", padding: "20px" }}>
        <h2>FlowGuard Dashboard</h2>

        {risks.map((risk, index) => (
          <div key={index} style={{
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid #ccc"
          }}>
            <h3>{risk.place}</h3>
            <p>Status: {risk.status}</p>
            <p>{risk.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;