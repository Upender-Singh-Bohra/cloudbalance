import React, { createContext, useState, useContext } from "react";
import CreativeLoader from "./CreativeLoader";
import VerticalBarsLoader from "./VerticalBarsLoader";

// Create context
const LoaderContext = createContext();

// Custom loader types
export const LOADER_TYPES = {
  CREATIVE: "creative",
  VERTICAL_BARS: "verticalBars",
};

export const LoaderProvider = ({ children }) => {
  const [loaderState, setLoaderState] = useState({
    isLoading: false,
    text: "Loading...",
    // type: LOADER_TYPES.CREATIVE,
    type: LOADER_TYPES.VERTICAL_BARS,
    barColors: ["#4398D7", "#D64794", "#253E66"],
  });

  const showLoader = (config = {}) => {
    setLoaderState({
      ...loaderState,
      isLoading: true,
      ...config,
    });
  };

  const hideLoader = () => {
    setLoaderState({
      ...loaderState,
      isLoading: false,
    });
  };

  return (
    <LoaderContext.Provider value={{ loaderState, showLoader, hideLoader }}>
      {children}

      {loaderState.type === LOADER_TYPES.CREATIVE ? (
        <CreativeLoader
          isLoading={loaderState.isLoading}
          text={loaderState.text}
        />
      ) : (
        <VerticalBarsLoader
          isLoading={loaderState.isLoading}
          text={loaderState.text}
          barColors={loaderState.barColors}
        />
      )}
    </LoaderContext.Provider>
  );
};

// Custom hook to use the loader
export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
