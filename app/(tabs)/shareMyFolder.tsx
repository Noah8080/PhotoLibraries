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
  // store list of user's the folder has been shared with
  const [sharedUserEmails, setSharedUsersEmails] = useState<string[]>([]);

  // function called on component mount to get the users that the folder has been shared with
  useEffect(() => {
    getSharedUsers();
  }, []); // TODO: add array of users to the dependency array to get auto updates

  // get the users that the folder has been shared with
  const getSharedUsers = async () => {
    try{
      
      const {data, error} = await supabase.from('connections').select('*').eq('user_id', user.id);
      console.log('Data from connections table', data, error);

      // Extract emails from the data and update state
      if (data) {
        const emails = data.map((user) => user.receiver_email); 
        setSharedUsersEmails(emails);
        console.log('already shared emails: ', emails);

      }

    }
    catch (error) {
      console.log('Error getting shared users: ', error);
    }

  };

  // function called onPress of the share folder button
  async function shareFolder() {
    console.log('Attempting to share folder with: ' + email);

    // boolean value for checking user's input
    let validInput = false;
    validInput = validateInput();
    console.log('Valid input: ' + validInput);

    // boolean value for checking if the user has already shared the folder with the entered emai
    let isRepeat = false;
    isRepeat = await checkRepeatEmail();

    // boolean vlaue for checking if the entered email is an account that exists in the database
    let isAccount = false;
    isAccount = await checkAccount();

    // if the user's input is valid and the folder has not already been shared with the entered email, add a record to the connections table
    if (validInput && !isRepeat && isAccount) {
      addRecord();
      alert('Folder successfully shared with: ' + email);

      setEmail(''); //clears the email input after sharing

    }


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

  // check supabase connections table to see if the user has already shared the folder with the entered email
  const checkRepeatEmail = async () => {

    try{
      const {data, error} = await supabase.from('connections').select('*').eq('receiver_email', email).eq('user_id', user.id);
      
      if (data && data.length > 0) {
        console.log('Folder already shared with: ' + email);
        alert('Folder already shared with: ' + email);
        return true;
      }
      else {
        console.log('Folder not already shared with: ' + email);
        return false;
      }
    }
    catch (error) {
      console.log('Error checking connections table: ', error);
      return false;
    }
  };

  // check supabase users table to see if the entered email is an account that exists in the database
  const checkAccount = async () => {
  
    // query the userEmails table in supabase to see if the entered email is an account that exists in the database 
    try{
      const {data, error} = await supabase.from('userEmails').select('*').eq('email', email);
      
      if (data && data.length > 0) {
        console.log('Account exists with email: ' + email);
        return true;
      }
      else {
        console.log('Account does not exist with email: ' + email);
        alert('Account does not exist with email: ' + email);
        return false;
      }
    }
    catch (error) {
      console.log('Error checking users table: ', error);
      return false
    }

  };



  // add a record to the connections table in supabase
  const addRecord = async () => {

    try{
      const {data, error} = await supabase.from('connections').insert({
        receiver_email: email,
        user_id: user.id,
        sender_email: user.email,
      })
      console.log('Record added to connections table', data, error);
    }
    catch (error) {
      console.log('Error adding record to connections table: ', error);
    }

  };

  const deleteRecord = async () => {
    try{
      const {data, error} = await supabase.from('connections').delete().eq('receiver_email', email).eq('user_id', user.id);
      if(data){
        alert('Folder successfully unshared with: ' + email);
        console.log('Record deleted from connections table', data, error);
        setEmail(''); //clears the email input after unsharing
      }
    }
    catch (error) {
      console.log('Error deleting record from connections table: ', error);
      alert('Error unsharing folder with: ' + email);
    }
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
        <Text style={styles.listHeading}>List of emails your folder is shared with: </Text>
        <FlatList
          data={sharedUserEmails}
          renderItem={({item}) => <Text  style={styles.emailList}>{item}</Text>}
          keyExtractor={(item) => item}>

        </FlatList>
        <Button title="Delete recepient" onPress={deleteRecord} />

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
  listHeading: {
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 16,
  },
  emailList: {
    paddingTop: 5,
    fontSize: 17,
    color: 'darkgreen',
  },



});


