import { Button } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, StyleSheet } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';
import { supabase } from '~/utils/supabase';

export default function Modal() {
  return (
    <>
      <Button onPress={() => supabase.auth.signOut()   }
      
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
