import { Stack, Link } from 'expo-router';
import { StyleSheet, View, FlatList, Text, Pressable, NativeModules} from 'react-native';
import { Image } from 'expo-image';
import { ScreenContent } from '~/components/ScreenContent';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
//import { useMedia } from '~/providers/mediaProviders';
import { AntDesign } from '@expo/vector-icons';
import { Button, Input } from '@rneui/themed';
import { NativeModule } from 'expo';
import * as Updates from 'expo-updates';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getImagekitUrlFromPath } from '~/utils/imagekit';
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "~/providers/authenticationProvider";
import { useMedia } from '~/providers/sharedMediaProviders';
//import MediaContextProvider from '~/providers/sharedMediaProviders';


export default function Home() {


  // store current user's data
  const {user} = useAuthentication();
  if (!user) {
      console.error('User is not defined');
      return;
    }

  // store list of emails that have shared their folder with the current user
  const [receivedUserEmails, setReceivedUsersEmails] = useState<string[]>([]);
  // store list of ID of the users that have shared their folder with the current user
  const [receivedIDs, setReceivedIDs] = useState<string[]>([]);
  const [senderID, setSenderID] = useState<string>('');

  // function called on component mount to get the users that the folder has been shared with
  useEffect(() => {
      getSharedList();
  }, []); // TODO: add array of users to the dependency array to get auto updatess

  const getSharedList = async () => {
      try{

          const {data, error} = await supabase.from('connections').select('*').eq('receiver_email', user.email);
          console.log('Data from connections table', data, error);

          // Extract emails from the data and update state
          if (data) {
              const emails = data.map((user) => user.sender_email); 
              setReceivedUsersEmails(emails);
              console.log('recipient of: ', emails);
          }
    
      }
      catch (error) {
          console.log('Error getting shared users: ', error);
      }

  };


  /**
   * called when an email in the flatlist is pressed
   * will query connections table for the user_id of the email
   * will save user id for accessing the photo bucket
   * @param item 
   */
  const youPressed = (item: string) => {
    console.log('you pressed the email:', item);
    // get the user id of the email
    getID(item);
    // TODO: load media from the bucket with the title of the sender's user ID


  };

  /**
   * gets the user id of the email that shared their folder with the current user
   * @param email 
   */
  const getID = async (email: string) => {
    try{

      const {data, error} = await supabase.from('connections').select('*').eq('receiver_email', user.email).eq('sender_email', email);

      // Extract emails from the data and update state
      if (data) {
        const senderID = data.map((user) => user.user_id); 
        setReceivedIDs(senderID);
        console.log('sender id of: ', senderID);
        setSenderID(senderID[0]);
        loadCloudPhotos(senderID[0]);

        console.log('sender id2 of: ', senderID[0]);
      }

    }
    catch (error) {
      console.log('Error getting shared users: ', error);
    }
  };


  // State to store the cloud photos
  const [cloudMedia, setCloudPhotos] = useState<any[]>([]);

  const loadCloudPhotos = async (senderID: string) => {
    console.log('loading cloud photos', senderID);
    try{
      const { data, error } = await supabase.from('photoAssets').select('*').eq('user_id', senderID);
      if (data) {
        setCloudPhotos(data);
      }
      if (error) {
        console.error("Error loading cloud photos:", error);
      }
    }
    catch (error) {
      console.log('Error getting cloud photos: ', error);
    }
  };


  return (
    <>
      <Stack.Screen options={{ title: 'View Folders' }} />
      <View style={styles.container}>
        <Text style={styles.header}>You have access to these users folders</Text>
        {/* Display the list of emails that have shared their folder with the current user */}
        <FlatList
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          data={receivedUserEmails}
          renderItem={({item}) => <Pressable onPress={()=>youPressed(item)}><Text  style={styles.emailList}>{item}</Text></Pressable>}
          keyExtractor={(item) => item}>
        </FlatList>


        {/* Render photos in a 3-column grid */}
        <FlatList
          data={cloudMedia}
          numColumns={3} // Display 3 columns in the grid
          keyExtractor={(item) => item.id.toString()} // Unique key for each item
          columnWrapperStyle={styles.columnWrapper} // Add space between columns
          contentContainerStyle={styles.contentContainer} // Add space between rows
          renderItem={({ item }) => (
              <Link href={`/photoAsset?id=${item.id}`} asChild>
                {/* Pressable is used to make the image clickable */}
                <Pressable style={{width: "33.3%"}}>
                  
                  <Image source={{uri: item.isLocalPhoto ? item.uri : getImagekitUrlFromPath(item.path, [])}}
                  style={{width: '100%', aspectRatio: 1 }} /> 

                  {!item.isInSupa && item.isLocalPhoto &&(
                    <AntDesign name = "cloudupload" size = {18} color = "white" style = {{position: 'absolute', top: 0, right: 5}}/>)
                  }

                

                </Pressable>
              </Link>
          )}
        />
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: 'lightblue',
    paddingTop: 10,
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 24,
  },
  emailList: {
    fontSize: 17,
    color: 'darkgreen',
  },
  contentContainer: {
    gap: 1, // Space between rows
  },
  columnWrapper: {
    gap: 1, // Space between columns
  },
  imageContainer: {
    width: '33.3%', // 3 columns in the grid
    aspectRatio: 1, // Square images
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4, // Optional: rounded corners for the images
  },
  uploadIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },

});
