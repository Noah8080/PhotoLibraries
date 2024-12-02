import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "./authenticationProvider";

type MediaContextType = {
  assets: any[]; // Store only cloud media (photos in Supabase)
  loadCloudPhotos: () => void;
  getPhotoByID: (id: string) => any | undefined; // Returns a photo from Supabase by ID
};

const MediaContext = createContext<MediaContextType>({
  assets: [],
  loadCloudPhotos: () => {},
  getPhotoByID: () => undefined,
});

export default function MediaContextProvider({ children }: PropsWithChildren) {
  // User's authentication data
  const { user } = useAuthentication();

  // State for storing cloud photos
  const [cloudMedia, setCloudPhotos] = useState<any[]>([]);

  useEffect(() => {
    // Load cloud photos on mount
    loadCloudPhotos();
  }, []);

  // Load photos stored in Supabase
  const loadCloudPhotos = async () => {
    const { data, error } = await supabase.from('photoAssets').select('*');
    if (data) {
      setCloudPhotos(data);
    }
    if (error) {
      console.error("Error loading cloud photos:", error);
    }
  };

  // Get photo from cloud by its ID
  const getPhotoByID = (id: string) => {
    return cloudMedia.find((asset) => asset.id === id);
  };

  return (
    <MediaContext.Provider value={{ assets: cloudMedia, loadCloudPhotos, getPhotoByID }}>
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => {
  return useContext(MediaContext);
};
