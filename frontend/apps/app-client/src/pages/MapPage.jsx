import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Corrige ícones do Leaflet no Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const apiPort = import.meta.env.VITE_API_PORT;

function MapPage() {
    const [location, setLocation] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://api.docker.localhost:${apiPort}/api/v1/recycling-points/nearby-address/?address=${encodeURIComponent(location)}`
            );

            if (response.ok) {
                const data = await response.json();
                setResults(data.recycling_points || []);
            } else {
                console.error("Error fetching:", response.statusText);
            }
        } catch (error) {
            console.error("Error during search:", error);
        } finally {
            setLoading(false);
        }
    };

    // Centro padrão (São Paulo)
    const defaultCenter = [-23.5505, -46.6333];

    return (
        <div style={{ padding: "20px" }}>
            <h1>Mapa de Pontos de Reciclagem</h1>

            <TextField
                label="Digite um endereço"
                value={location}
                onChange={handleLocationChange}
                variant="outlined"
                fullWidth
                margin="normal"
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading}
            >
                {loading ? "Buscando..." : "Buscar"}
            </Button>

            {/* MAPA */}
            <div style={{ height: "500px", marginTop: "20px" }}>
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Marcadores da API */}
                    {results.map((point) => (
                        <Marker
                            key={point.recycling_point_id}
                            position={[point.latitude, point.longitude]}
                        >
                            <Popup>
                                <strong>{point.name}</strong><br />
                                {point.address}<br />
                                {point.distance_meters}m de distância
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Lista de resultados */}
            <h2 style={{ marginTop: "20px" }}>Resultados:</h2>
            <ul>
                {results.map((point) => (
                    <li key={point.recycling_point_id}>
                        {point.name} — {point.address} ({point.distance_meters}m)
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MapPage;
