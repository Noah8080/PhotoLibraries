import { Stack, Link } from 'expo-router';
import { StyleSheet, View, FlatList, Text, Pressable, NativeModules} from 'react-native';
import { Image } from 'expo-image';
import { ScreenContent } from '~/components/ScreenContent';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { useMedia } from '~/providers/mediaProviders';
import { AntDesign } from '@expo/vector-icons';
import { Button } from '@rneui/themed';
import { NativeModule } from 'expo';
import * as Updates from 'expo-updates';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getImagekitUrlFromPath } from '~/utils/imagekit';

export default function Home() {
  const {assets, loadLocalMedia} = useMedia();

  // Function to reload the app
  const reload = async () => {
    await Updates.reloadAsync(); // This triggers a reload of the app
  };
  
  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <Button onPress={reload}>Refresh</Button>

      {/* used to display the content in a list */}
      <FlatList
        columnWrapperStyle={{gap: 1}} // gap between columns
        contentContainerStyle={{gap: 1}} // gap between rows
        numColumns={3} // number of columns to display
        onEndReached={loadLocalMedia} // when the end of the list is reached, load the next page of media
        onEndReachedThreshold={1}
        //refreshing={load}
        data={assets} 
        renderItem={({item}) => (
          // Link to the photoAsset page
          <Link href={`/photoAsset?id=${item.id}`} asChild>
            {/* Pressable is used to make the image clickable */}
            <Pressable style={{width: "33.3%"}}>
              
              <Image source={{uri: item.isLocalPhoto ? item.uri : getImagekitUrlFromPath(item.path, [])}}
              style={{width: '100%', aspectRatio: 1 }} /> 

              {!item.isInSupa && item.isLocalPhoto &&(
              <AntDesign name = "cloudupload" size = {18} color = "white" style = {{position: 'absolute', top: 0, right: 5}}/>

              )
              }

              

            </Pressable>
          </Link>
          )} // width of 33.3% makes 3 columns and aspect ratio of 1 makes images square
        />

    </>
  );
}