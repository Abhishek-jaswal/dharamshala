/**
 * GoogleMap.tsx
 * Google Maps component for showing locations in pick & drop
 */

interface MapMarker {
    lat: number;
    lng: number;
    label?: string;
    color?: 'red' | 'green' | 'blue' | 'yellow';
}

interface GoogleMapProps {
    center?: { lat: number; lng: number };
    markers?: MapMarker[];
    zoom?: number;
    height?: string;
    onLocationSelect?: (lat: number, lng: number) => void;
}

export default function GoogleMap({
    center,
    markers = [],
    zoom = 15,
    height = '400px',
    onLocationSelect,
}: GoogleMapProps) {
    // Build Google Maps static API URL
    const getMapUrl = () => {
        if (!center) return '';

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';

        const params = new URLSearchParams({
            center: `${center.lat},${center.lng}`,
            zoom: zoom.toString(),
            size: '600x400',
            maptype: 'roadmap',
            key: apiKey,
        });

        // Add markers
        markers.forEach((marker, idx) => {
            const markerColor = marker.color || 'red';
            const label = marker.label ? marker.label[0].toUpperCase() : '';
            params.append(
                'markers',
                `color:${markerColor}|label:${label}|${marker.lat},${marker.lng}`
            );
        });

        return `${baseUrl}?${params.toString()}`;
    };

    // For local testing without API key, use a simple OpenStreetMap based fallback
    const getMapUrlFallback = () => {
        if (!center) return '';
        // Using OpenStreetMap static map service as fallback
        const tiles = 'https://c.tile.openstreetmap.org';
        // Returns a tile URL for the map
        return `https://static.openstreetmap.org/osm_logo.png`; // Placeholder
    };

    const mapUrl = getMapUrl();
    const fallbackUrl = getMapUrlFallback();

    // If no center is provided, show a placeholder
    if (!center) {
        return (
            <div
                style={{
                    width: '100%',
                    height,
                    background: '#f0f0f0',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 12,
                    border: '1px solid #e2e8f0',
                }}
            >
                <div style={{ fontSize: 32 }}>📍</div>
                <div style={{ textAlign: 'center', fontSize: 14, color: '#64748b' }}>
                    <div style={{ fontWeight: 600 }}>Location not available</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                        Enter your address to see it on map
                    </div>
                </div>
            </div>
        );
    }

    // Desktop: Show interactive Lite Embed version (if API key is available)
    // Mobile: Show static map image
    const isDesktop =
        typeof window !== 'undefined' && window.innerWidth >= 768;

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
            }}
        >
            {isDesktop && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                // Interactive map for desktop
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                        `${center.lat},${center.lng}`
                    )}`}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            ) : (
                // Static map image
                <div
                    onClick={() => {
                        // Open in Google Maps on click
                        if (center) {
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`,
                                '_blank'
                            );
                        }
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 12,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as any).style.background =
                            'linear-gradient(135deg, #dcfce7, #f0fdf4)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as any).style.background =
                            'linear-gradient(135deg, #f0fdf4, #f8fafc)';
                    }}
                >
                    <div style={{ fontSize: 40 }}>🗺️</div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                        </div>
                        <div
                            style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}
                        >
                            Click to view on Google Maps
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
