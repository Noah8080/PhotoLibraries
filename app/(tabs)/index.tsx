import { Stack } from 'expo-router';
import { StyleSheet, View, FlatList, Text} from 'react-native';
import { Image } from 'expo-image';
import { ScreenContent } from '~/components/ScreenContent';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';

export default function Home() {


  const [permissionResponse, reqestPermission] = MediaLibrary.usePermissions();

  const [localMedia, setLocalMedia] = useState<MediaLibrary.Asset[]>([]);

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
    const mediaPage = await MediaLibrary.getAssetsAsync();
    console.log(JSON.stringify(mediaPage, null, 2));
    // set local media to the assets returned from the media library
    setLocalMedia(mediaPage.assets);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      {/* used to display the content in a list */}
      <FlatList
        columnWrapperStyle={{gap: 1}} // gap between columns
        contentContainerStyle={{gap: 1}} // gap between rows
        numColumns={4} // number of columns to display
        data={localMedia} renderItem={({item}) => (
           <Image source={{uri: item.uri}} 
           style={{width: '33.3%', aspectRatio: 1 }} /> )} // width of 33.3% makes 3 columns and aspect ratio of 1 makes images square
        />


    </>
  );
}


