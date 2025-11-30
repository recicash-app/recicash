import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Ícones padrão
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Ícone selecionado (verde)
const greenIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";

let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
});
let SelectedIcon = L.icon({
    iconUrl: greenIconUrl,
    shadowUrl: iconShadow,
});

const redIconUrl =
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";

let SearchIcon = L.icon({
        iconUrl: redIconUrl,
        shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const apiPort = import.meta.env.VITE_API_PORT;

/* =====================================================
   =============== FIT BOUNDS COMPONENT =================
   ===================================================== */
function FitBoundsHandler({ searchCoords, results }) {
    const map = useMap();

    React.useEffect(() => {
        const points = [];

        if (searchCoords) points.push(searchCoords);
        results.forEach((p) => points.push([p.latitude, p.longitude]));

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [80, 80] });
        }
    }, [searchCoords, results, map]);

    return null;
}

function MapPage() {
    const [location, setLocation] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchCoords, setSearchCoords] = useState(null);

    const handleLocationChange = (event) => setLocation(event.target.value);

    const handleSearch = async () => {
        setLoading(true);
        setSelectedId(null);

        try {
            const response = await fetch(
                `http://api.docker.localhost:${apiPort}/api/v1/recycling-points/nearby-address/?address=${encodeURIComponent(location)}`
            );

            if (response.ok) {
                const data = await response.json();

                const sorted = (data.recycling_points || []).sort(
                    (a, b) => a.distance_meters - b.distance_meters
                );
                setResults(sorted);

                if (data.geocoded_location) {
                    setSearchCoords([
                        data.geocoded_location.latitude,
                        data.geocoded_location.longitude
                    ]);
                } else {
                    setSearchCoords(null);
                }
            } else {
                console.error("Error fetching:", response.statusText);
            }
        } catch (error) {
            console.error("Error during search:", error);
        } finally {
            setLoading(false);
        }
    };

    const defaultCenter = [-23.5505, -46.6333];

    // =============================
    // ESTILOS
    // =============================
    const styles = {
        wrapper: {
            display: "flex",
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            fontFamily: "Inter, sans-serif",
        },
        leftSide: {
            width: "40%",
            minWidth: "350px",
            padding: "28px",
            background: "#f8fafc",
            overflowY: "auto",
            borderRight: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
        },
        rightSide: {
            flex: 1,
            position: "relative",
        },
        title: {
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            background: "linear-gradient(90deg, #16a34a, #4ade80)",
            WebkitBackgroundClip: "text",
            color: "transparent",
        },
        searchButton: {
            height: "48px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            textTransform: "none",
            background: "linear-gradient(90deg, #16a34a, #4ade80)",
            marginTop: "10px",
        },
        resultCard: {
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: "12px",
            cursor: "pointer",
            transition: "0.2s",
        },
        resultCardSelected: {
            background: "#dcfce7",
            border: "1px solid #4ade80",
        },
        mapContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
    };

    return (
        <div style={styles.wrapper}>

            {/* LADO ESQUERDO */}
            <div style={styles.leftSide}>
                <h1 style={styles.title}>Pontos de Reciclagem</h1>

                <TextField
                    label="Digite um endereço"
                    value={location}
                    onChange={handleLocationChange}
                    variant="outlined"
                    fullWidth
                />

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    style={styles.searchButton}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </Button>

                <h2 style={{ marginTop: "20px", fontWeight: "600" }}>Resultados</h2>

                <div style={{ marginTop: "10px" }}>
                    {results.map((point) => {
                        const isSelected = selectedId === point.recycling_point_id;
                        return (
                            <div
                                key={point.recycling_point_id}
                                style={{
                                    ...styles.resultCard,
                                    ...(isSelected ? styles.resultCardSelected : {}),
                                }}
                                onClick={() => setSelectedId(point.recycling_point_id)}
                            >
                                <strong>{point.name}</strong><br />
                                {point.address}<br />
                                <span style={{ opacity: 0.7 }}>{point.distance_meters}m</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* LADO DIREITO - MAPA */}
            <div style={styles.rightSide}>
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={styles.mapContainer}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* componente que ajusta o zoom */}
                    <FitBoundsHandler
                        searchCoords={searchCoords}
                        results={results}
                    />

                    {/* marcador do endereço buscado */}
                    {searchCoords && (
                        <Marker position={searchCoords} icon={SearchIcon}>
                            <Popup>Local buscado</Popup>
                        </Marker>
                    )}

                    {/* marcadores dos pontos */}
                    {results.map((point) => (
                        <Marker
                        key={point.recycling_point_id}
                        position={[point.latitude, point.longitude]}
                        icon={
                            selectedId === point.recycling_point_id
                                ? SelectedIcon
                                : DefaultIcon
                        }
                        eventHandlers={{
                            click: () => setSelectedId(point.recycling_point_id)
                        }}
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
        </div>
    );
}

export default MapPage;
