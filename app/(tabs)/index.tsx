import { Stack, Link } from 'expo-router';
import { StyleSheet, View, FlatList, Text, Pressable} from 'react-native';
import { Image } from 'expo-image';
import { ScreenContent } from '~/components/ScreenContent';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { useMedia } from '~/providers/mediaProviders';

export default function Home() {
  const {assets, loadLocalMedia} = useMedia();
  //console.log(abc);

  
  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />

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
              <Image source={{uri: item.uri}}  
              style={{width: '100%', aspectRatio: 1 }} /> 
            </Pressable>
          </Link>
          )} // width of 33.3% makes 3 columns and aspect ratio of 1 makes images square
        />

    </>
  );
}


