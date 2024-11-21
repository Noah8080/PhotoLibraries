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

  // set variables for the entered email
  const [email, setEmail] = useState('');
  // store current user's data
  const {user} = useAuthentication();
  if (!user) {
    console.error('User is not defined');
    return;
  }

  function shareFolder() {
    console.log('Folder shared with: ' + email);

    // boolean value for checking user's input
    let validInput = false;
    validInput = validateInput();
    console.log('Valid input: ' + validInput);

    if (validInput){
      addRecord();
      alert('Folder shared with: ' + email);
    }



    setEmail(''); //clears the email input after sharing

  }

  /**
   * validates the user's input before calling the sign in function
   */
  const validateInput = () => { 
    // create an array to hold error messages
    let errors = [];

    let isEmail = false;
    // the supabase API uses parameterized queries to prevent SQL injection attacks, but we will still validate the user's input
    let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
 
    if (emailReg.test(email) === true) {
      console.log('Email is valid: ' + email);
      isEmail = true;
    }
    else {
      console.log('Invalid email format: ' + email);
      errors.push('Email is invalid');
      isEmail = false;
    }
    return isEmail;

  }


  const addRecord = async () => {

    const {data, error} = await supabase.from('connections').insert({
      receiverEmail: email,
      user_id: user.id,
    })
    console.log('Record added to connections table', data, error);

  };
  

  return (
    <>
      <Stack.Screen options={{ title: 'Share Your Folder' }} />
      <View style={styles.container}>
        <Text style={styles.header}>Share Your Folder</Text>
        <Text style={styles.header2}>Enter the email of the recepient: </Text>
        <Input style={styles.emailInput} placeholder="Email" value={email} //allows for clearing of inputbox after btn press
            leftIcon={{ type: 'font-awesome', name: 'envelope' }} 
            onChangeText={(text) => setEmail(text.toLowerCase())}/>
        <Button title="Share" onPress={shareFolder}/>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'lightpink',
  },
  header: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 24,
  },
  emailInput: {
    marginTop: 12,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1.8,
    padding: 3,
  },
  header2: {
    paddingLeft: 9,
    fontSize: 14,
  },



});


