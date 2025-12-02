import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import { API_URL } from '@shared/utils/constants';

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
    const [useLocation, setUseLocation] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchCoords, setSearchCoords] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleLocationChange = (event) => setLocation(event.target.value);

    /* =====================================================
       ============== BUSCA POR ENDEREÇO ==================
       ===================================================== */
    const handleSearch = async () => {
        setLoading(true);
        setSelectedId(null);
        setHasSearched(true);

        try {
            const response = await fetch(
                `${API_URL}/recycling-points/nearby-address/?address=${encodeURIComponent(location)}`
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


    /* =====================================================
       ========== BUSCAR USANDO LOCALIZAÇÃO REAL ===========
       ===================================================== */
    const triggerRealLocationSearch = () => {
        if (!navigator.geolocation) {
            alert("Geolocalização não é suportada neste navegador.");
            return;
        }

        setLoading(true);
        setSelectedId(null);
        setHasSearched(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                setSearchCoords([lat, lon]);
                setLocation("");

                try {
                    const response = await fetch(
                        `${API_URL}/recycling-points/nearby/?lat=${lat}&lon=${lon}`
                    );

                    if (response.ok) {
                        const data = await response.json();

                        const sorted = (data || []).sort(
                            (a, b) => a.distance_meters - b.distance_meters
                        );

                        setResults(sorted);
                    } else {
                        console.error("Erro na busca:", response.statusText);
                    }
                } catch (err) {
                    console.error("Erro ao buscar ecopontos:", err);
                } finally {
                    setLoading(false);
                }
            },

            (err) => {
                console.error(err);
                alert("Não foi possível obter sua localização.");
                setUseLocation(false);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
            }
        );
    };

    /* =====================================================
       ============== QUANDO CLICA NO CHECKBOX =============
       ===================================================== */
    const handleToggleCheckbox = () => {
        const newValue = !useLocation;
        setUseLocation(newValue);

        if (newValue) {
            triggerRealLocationSearch();
        } else {
            setSearchCoords(null);
            setResults([]);
            setHasSearched(false);
        }
    };

    const defaultCenter = [-23.5505, -46.6333];

    // =============================
    // ESTILOS
    // =============================

    const styles = {
        wrapper: {
            display: "flex",
            height: "80vh",
            width: "100%",
            overflow: "hidden",
        },
        leftSide: {
            width: "40%",
            minWidth: "350px",
            paddingLeft: "28px",
            paddingRight: "28px",
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
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "20px",
            background: "#93B17D",
            WebkitBackgroundClip: "text",
            fontFamily: '"Volkhov", serif',
            color: "transparent",
        },
        searchButton: {
            height: "48px",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "600",
            textTransform: "none",
            background: "#93B17D",
            marginTop: "10px",
        },
        resultCard: {
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: "12px",
            cursor: "pointer",
            transition: "0.2s",
        },
        resultCardSelected: {
            background: "rgba(127, 165, 109, 0.3)",
            border: "1px solid rgba(127, 165, 109)",
        },
        mapContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "0px 0px 263.5px 0px",
            boxShadow: "10px 8px 12.3px -4px #C4C4C480",
            border: "5px solid #93B17D",
            overflow: "hidden",
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
                    disabled={useLocation}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                        borderRadius: "5px",
                        },
                    }}
                />


                {/* CHECKBOX USAR LOCALIZAÇÃO ATUAL */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useLocation}
                            onChange={handleToggleCheckbox}
                        />
                    }
                    label="Usar minha localização atual"
                    style={{ marginTop: "10px" }}
                />

                <Button
                    fullWidth
                    variant="contained"
                    disabled={loading || useLocation}
                    onClick={handleSearch}
                    style={styles.searchButton}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </Button>

                <h2 style={{ marginTop: "50px", fontWeight: "600", fontSize: "2.25rem", fontFamily: '"Volkhov", serif', }}>Resultados</h2>

                <div style={{ marginTop: "10px" }}>
                    {loading && (
                        <div style={{ textAlign: "center", padding: "20px", color: "#93B17D", fontWeight: "600" }}>
                            Buscando ecopontos...
                        </div>
                    )}
                    
                    {!loading && hasSearched && results.length === 0 && (
                        <div style={{ textAlign: "center", padding: "20px", color: "#666", fontStyle: "italic" }}>
                            Nenhum ecoponto encontrado em um raio de 5km.
                        </div>
                    )}

                    {!loading && results.map((point) => {
                        const isSelected = selectedId === point.recycling_point_id;
                        return (
                            <div
                                key={point.recycling_point_id}
                                style={{
                                    ...styles.resultCard,
                                    ...(isSelected ? styles.resultCardSelected : {}),
                                }}
                                onClick={() =>
                                    setSelectedId(prev =>
                                        prev === point.recycling_point_id ? null : point.recycling_point_id
                                    )
                                }
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

                    <FitBoundsHandler searchCoords={searchCoords} results={results} />

                    {searchCoords && (
                        <Marker position={searchCoords} icon={SearchIcon}>
                            <Popup>Localização inicial</Popup>
                        </Marker>
                    )}

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
                                click: () => {
                                    setSelectedId(prev =>
                                        prev === point.recycling_point_id ? null : point.recycling_point_id
                                    );
                                }
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
