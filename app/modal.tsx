import { Button } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, StyleSheet, NativeModules } from 'react-native';
import * as Updates from 'expo-updates';
import { ScreenContent } from '~/components/ScreenContent';
import { supabase } from '~/utils/supabase';

const reload = () => {
  NativeModules.DevSettings.reload();
}

export default function Modal() {

  const signOutReload = async() => {
    supabase.auth.signOut();
    await Updates.reloadAsync(); // This triggers a reload of the app
  }

  return (
    <>
      {/* <Button onPress={() => supabase.auth.signOut()} */}
      <Button onPress={() => supabase.auth.signOut()}

      
       style={styles.btnAct} title='sign out'></Button>
      <Text style={styles.message}>Close this tag after pressing signout</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 20,
    color: 'blue',
    textAlign: 'center',
    //display: 'none',
  },
  btnAct:{
    padding: 10,

  },
});
