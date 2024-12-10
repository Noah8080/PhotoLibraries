import { Stack, Link } from 'expo-router';
import { StyleSheet, View, FlatList, RefreshControl, Text, Pressable, NativeModules} from 'react-native';
import { useEffect, useState } from 'react';
import { Button, Input } from '@rneui/themed';
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "~/providers/authenticationProvider";



export default function Home() {

  // set variables for the entered email
  const [email, setEmail] = useState('');
  // set values for refreshing the page
  const [refreshing, setRefreshing] = useState(false);
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

    return sharedUserEmails;
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
      await addRecord();
      alert('Folder successfully shared with: ' + email);
      setEmail(''); //clears the email input after sharing
      // refresh the page to show the updated list of shared users
      await getSharedUsers();
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

    // get a list of shared users to make sure the user is deleting an email they are currently conencted to
    // this is because deleting a record returns a null value and we cannot check if the email was deleted
    // to handle feedback to the user
    const sharedUsers = await getSharedUsers();
    // if the email is in the list of users, call the database to delete the record
    if(sharedUsers.includes(email)) {
      try{
        const {data, error} = await supabase.from('connections').delete().eq('receiver_email', email).eq('user_id', user.id);
        console.log('Record deleted from connections table', data, error);
        alert('Folder successfully unshared with: ' + email);

      }
      catch (error) {
        console.log('Error deleting record from connections table: ', error);
        alert('Error unsharing folder with: ' + email);
      }
    }
    // if it is not, alert the user that the email is not in the list of shared users
    else {
      console.log('Email is not in shared users list');
      alert('You were not sharing a folder with: ' + email); 
    }
    setEmail(''); //clears the email input after sharing
    await getSharedUsers(); // refresh the list of shared users

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
    backgroundColor: 'orange',
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


