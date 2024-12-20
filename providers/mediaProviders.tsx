import { createContext, PropsWithChildren, useContext } from "react";
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { decode } from "base64-arraybuffer";
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "./authenticationProvider";
import { store } from "expo-router/build/global-state/router-store";
import photoAssetPage from "~/app/photoAsset";
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

  // get data of photo's stored in supabase
  const [cloudMedia, setCloudPhotos] = useState([]);
  // make an array of all media. Filter out the media that is both local and cloud to be loaded with the cloud media
  const media = [...cloudMedia, ...localMedia.filter((asset) => !asset.isInSupa)];
  const media1 = [...cloudMedia, ...localMedia];

  useEffect(() => {loadCloudPhotos()}, []);


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


  // load the photos that are stored in supabase
  const loadCloudPhotos = async () => {
    const {data, error} = await supabase.from('photoAssets').select('*');
    if(data) {
      setCloudPhotos(data);
    }
  };


  /**
   * loads local media from the user's device, searches for media after the end of the current page
   * if there is more than one page of media, this method is called again and will load the next page in front of the exisiting
   * @returns 
   */
  const loadLocalMedia = async () => {
    if(loading || !hasNextPage) {
      return;
    }
    setLoading(true);
    console.log('loading local media');
    const mediaPage = await MediaLibrary.getAssetsAsync({ after: endCursor }); // get the next page of media
    //console.log(JSON.stringify(mediaPage, null, 2));


    // loop through photo assets table in supabase, checking for photos that are already backed up
    // results are stored in newMedia
    const newMedia = await Promise.all(
      mediaPage.assets.map(async (asset) => {
        // query supabase for photo ids that match locally stored photos
        const {count} = await supabase.from('photoAssets').select('*', {count: 'exact', head: true}).eq('id', asset.id);

        // create an array of items to be returned
        return{
          ...asset,
          isInSupa: !!count && count > 0,
          isLocalPhoto: true,
        }
      })
    );

    console.log('========================');
    console.log(JSON.stringify(newMedia, null, 2));

    // set local media to the assets returned from the media library
    // if there is more than one page of media, this method is called again and will load the next page in front of the exisiting
    setLocalMedia((existingItems) => [...existingItems, ...newMedia]);
    setHasNextPage(mediaPage.hasNextPage);
    setEndCursor(mediaPage.endCursor);
    
    setLoading(false);
  };

    {/* create function for loading photo in new page */}
    const getPhotoByID = (id: string) => {
      // this had to be changed from localMedia to media to include cloud photos
      return media1.find((asset) => asset.id === id);
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
      const {data: uploadedImage, error} = await supabase.storage.from('photos').upload(`${user.id}/${asset.filename}`, arrayBuffer, {contentType: 'image/jpeg', upsert: true});
      console.log('Photo uploaded to bucket: ',uploadedImage, error);
      alert('Photo uploaded');


      // upload photo data to photoAsset table in supabase
      // this will be used to load images that are in user's table but not their local device
      if(uploadedImage) {
        const {data, error} = await supabase.from('photoAssets').upsert({

          id: asset.id,
          path: uploadedImage?.path,
          user_id: user.id,
          mediaType: asset.mediaType,
          objectID: uploadedImage?.id,  
        }).select().single();
        console.log('Photo assets uploaded to supabase',data, error);
      }

      // TODO: SECure against potential exe files uploaded as photos
      // look at magic bytes

    }

    return (
        //<MediaContext.Provider value={{assets: localMedia, loadLocalMedia, getPhotoByID, uploadPhoto}}>
        <MediaContext.Provider value={{assets: media, loadLocalMedia, getPhotoByID, uploadPhoto}}>

            {children}
        </MediaContext.Provider>
    )
}


export const useMedia = () => {
   return useContext(MediaContext);
}