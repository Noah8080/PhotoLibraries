import { Button } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, StyleSheet, NativeModules } from 'react-native';
import * as Updates from 'expo-updates';
import { ScreenContent } from '~/components/ScreenContent';
import { supabase } from '~/utils/supabase';
import { useEffect, useState } from 'react';

export default function Modal() {

  const signOutReload = async() => {
    supabase.auth.signOut();
    await Updates.reloadAsync(); // This triggers a reload of the app
  }
  useEffect(() => {getUserEmail();}, []);

  // make state for displaying user's email
  const [email, setEmail] = useState<string | undefined>(undefined);
  // get user's email from the supabase session
  const getUserEmail = async () => {
    try{
      const {data: {session}, error} = await supabase.auth.getSession();
      if(error) {
        throw error;
      }
      if(session) {
        setEmail(session.user.email);
      }
    } 
    catch (error){
      console.log("error getting the user's data");
    }
    
  }


  return (
    <>
      <Text style={styles.message}>Signed in with: {email}</Text>
      <Button onPress={() => signOutReload()}
       style={styles.btnAct} title='sign out'></Button>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 20,
    color: 'blue',
    textAlign: 'center',
    margin: 10,
  },
  btnAct:{
    padding: 10,

  },
});
