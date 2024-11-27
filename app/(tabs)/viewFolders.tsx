import { Stack, Link } from 'expo-router';
import { StyleSheet, View, FlatList, Text, Pressable, NativeModules} from 'react-native';
import { Image } from 'expo-image';
import { ScreenContent } from '~/components/ScreenContent';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { useMedia } from '~/providers/mediaProviders';
import { AntDesign } from '@expo/vector-icons';
import { Button, Input } from '@rneui/themed';
import { NativeModule } from 'expo';
import * as Updates from 'expo-updates';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getImagekitUrlFromPath } from '~/utils/imagekit';
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "~/providers/authenticationProvider";



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

    // gets images and their data from the mediaProvider
    const {assets, loadLocalMedia} = useMedia();

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
        }
  
      }
      catch (error) {
          console.log('Error getting shared users: ', error);
      }
    };


  return (
    <>
      <Stack.Screen options={{ title: 'View Folders' }} />
      <View style={styles.container}>
        <Text style={styles.header}>You have access to these users folders</Text>
        <FlatList
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          data={receivedUserEmails}
          renderItem={({item}) => <Pressable onPress={()=>youPressed(item)}><Text  style={styles.emailList}>{item}</Text></Pressable>}
          keyExtractor={(item) => item}>

        </FlatList>

        {/* used to display the content in a list 
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
              <Pressable style={{width: "33.3%"}}>
                
                <Image source={{uri: item.isLocalPhoto ? item.uri : getImagekitUrlFromPath(item.path, [])}}
                style={{width: '100%', aspectRatio: 1 }} /> 

                {!item.isInSupa && item.isLocalPhoto &&(
                  <AntDesign name = "cloudupload" size = {18} color = "white" style = {{position: 'absolute', top: 0, right: 5}}/>)
                }

                

              </Pressable>
            </Link>
          )} // width of 33.3% makes 3 columns and aspect ratio of 1 makes images square
        />  */}
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'lightblue',
    paddingTop: 15,
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

});
