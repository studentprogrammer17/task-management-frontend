import React, { useEffect, useState } from "react";
import { LoadScript } from "@react-google-maps/api";

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

export const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoaded]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}
      onLoad={() => setIsLoaded(true)}
    >
      {isLoaded ? children : <div>Loading Google Maps...</div>}
    </LoadScript>
  );
};
