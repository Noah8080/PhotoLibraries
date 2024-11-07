import { createContext, PropsWithChildren, useContext } from "react";
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { decode } from "base64-arraybuffer";
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "./authenticationProvider";
type MediaContextType = {
    assets: MediaLibrary.Asset[];
    loadLocalMedia: () => void;
    getPhotoByID: (id: string) => MediaLibrary.Asset | undefined;
    uploadPhoto: (asset: MediaLibrary.Asset) => void;
};

const MediaContext = createContext<MediaContextType>({
    assets: [],
    loadLocalMedia: () => {},
    getPhotoByID: () => undefined,
    uploadPhoto: () => {},
});

export default function MediaContextProvider({ children }: PropsWithChildren) {
    
  const [permissionResponse, reqestPermission] = MediaLibrary.usePermissions();
  const [localMedia, setLocalMedia] = useState<MediaLibrary.Asset[]>([]);
  // create varibles for finding end of page for local media, to be able to load more than one page of media
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>();
  // make sure method can't be called while it is already loading
  const [loading, setLoading] = useState(false);
  // get user's ID from the supabase session to be able to upload photos to their account's bucket
  const {user} = useAuthentication();

  useEffect(() => {
    // gets permission from user to access their local media library
    if(permissionResponse?.status != 'granted') {
        
        reqestPermission();
    }
  }, []);

  // if permission is granted, load local media
  useEffect(() => {
    if(permissionResponse?.status === 'granted') {
      loadLocalMedia();
    }
  }, [permissionResponse]);

  const loadLocalMedia = async () => {
    if(loading || !hasNextPage) {
      return;
    }
    setLoading(true);
    console.log('loading local media');
    const mediaPage = await MediaLibrary.getAssetsAsync({ after: endCursor }); // get the next page of media
    //console.log(JSON.stringify(mediaPage, null, 2));

    // set local media to the assets returned from the media library
    // if there is more than one page of media, this method is called again and will load the next page in front of the exisiting
    setLocalMedia((existingItems) => [...existingItems, ...mediaPage.assets]);
    setHasNextPage(mediaPage.hasNextPage);
    setEndCursor(mediaPage.endCursor);
    
    setLoading(false);
  };

    {/* create function for loading photo in new page */}
    const getPhotoByID = (id: string) => {
      return localMedia.find((asset) => asset.id === id);
    }

    /**
     * create a function to upload photos to supabase
     */
    const uploadPhoto = async (asset: MediaLibrary.Asset) => {
      // display the current photo's data to the log
      //console.log('uploading photo: ', asset);

      const photoInfo = await MediaLibrary.getAssetInfoAsync(asset);

      // if the photo is not found or the userID is not found, display a warning
      if(!photoInfo.localUri || !user?.id) {
        console.warn('photo not found');
        return;
      }

      // read the photo as a base64 string...
      const base64String = await FileSystem.readAsStringAsync(photoInfo.localUri, {encoding: 'base64'});
      // create an array buffer from the base64 string, that will be uploaded to supabase
      const arrayBuffer = decode(base64String);
      // call supabase storage to upload the photo  (upsert overwrites the photo in the database if one with the same name already exists) 
      const {data, error} = await supabase.storage.from('photos').upload(`${user.id}/${asset.filename}`, arrayBuffer, {contentType: 'image/jpeg'});
      console.log(data, error);
      alert('Photo uploaded');

      // TODO: SECure against potential exe files uploaded as photos
      // look at magic bytes

    }

    return (
        <MediaContext.Provider value={{assets: localMedia, loadLocalMedia, getPhotoByID, uploadPhoto}}>
            {children}
        </MediaContext.Provider>
    )
}


export const useMedia = () => {
   return useContext(MediaContext);
}

