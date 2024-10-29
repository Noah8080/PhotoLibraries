import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Image } from 'react-native'
import { supabase } from '~/utils/supabase'
import { Button, Input } from '@rneui/themed'
//import Logo from '~/assets/icon-logo.png'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)


  // creat function for validating user's input before calling the sign up or sign in functions
  const signUpPressed = () => {

    validateInput();

  }

  /**
   * validates the user's input before calling the sign in function
   */
  const validateInput = () => { 
    // create an array to hold error messages
    let errors = [];

    let isEmail = false;
    let isPassword = false;
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

    // ------validate password----
        // check if the password is valid
        // password must be at least 8 characters long
        // password must contain at least one number
        // password must contain at least one uppercase letter
        // password must contain at least one lowercase letter
        // password must contain at least one special character
        let passwordReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (passwordReg.test(password) === true){
            console.log('password is valid: ' + password);
            isPassword = true;
        }
        else{
            console.log('password is not valid: ' + password);
            isPassword = false;
            errors.push('\n \npassword must be at least 8 characters long, have no spaces, contain one uppercase letter, one lowercase letter, at least one number, and one special character');
        }

        // if the email and password are valid, call the sign up function
        if (isEmail && isPassword) {
            console.log('inputs were valid');
            signUpWithEmail();
        }
        else {
            // if the email or password are not valid, display the error messages
            alert(errors);
        }

  }



  /**
   * function for a returning user to sign in
   * email
   * password
   */
  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  /**
   * function for a new user to sign up
   * email
   * password
   */
  // TODO: add a username field
  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  // TODO: change tyling and formatting to match that of other started project
  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>

        <Input style={styles.imBorders}
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          className='rounded-md boder border'
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input style={styles.imBorders}
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          className='rounded-md boder border'

        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up"  disabled={loading} onPress={() => signUpPressed()} />

      </View>
      {/* <Image source={Logo} style={[styles.logo, ]}  /> */}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    alignContent: 'center',
    backgroundColor: 'pink',
    width: '100%',
    height: '100%',
  },
  verticallySpaced: {
    paddingTop: 3,
    paddingBottom: 3,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  imBorders: {
    borderWidth: 1.5,
    borderColor: 'black',
    backgroundColor: 'lightgray',
  },

  logo: {
    width: '75%',
    height: 200,
    marginTop: 40,
    marginBottom: 10,
    alignContent: 'center',
    marginLeft: 80,
    aspectRatio: 1,

},
  
})