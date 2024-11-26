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
                const emails = data.map((user) => user.receiver_email); 
                setReceivedUsersEmails(emails);
                console.log('recipient of: ', emails);
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
          data={receivedUserEmails}
          renderItem={({item}) => <Text  style={styles.emailList}>{item}</Text>}
          keyExtractor={(item) => item}>

        </FlatList>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'lightblue',
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 24,
  },
  emailList: {
    paddingTop: 5,
    fontSize: 17,
    color: 'darkgreen',
  },

});
