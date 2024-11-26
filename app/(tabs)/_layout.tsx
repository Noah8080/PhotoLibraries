import { Link, Redirect, Tabs } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useAuthentication } from '~/providers/authenticationProvider';

export default function TabLayout() {

  // get the user's authentication status, 
  //if they are not loged in, they will be redirected to the login/create account page
  const { user } = useAuthentication();
  //TODO: can change this to do other things like hiding share or upload feature.
  //      In case you would want use to be able to view photos without being logged in
  //      could also use this for looking at users the folder has been shared with 
  if (!user) {
    return (
      <Redirect href="/(authentication)/login" />
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="shareMyFolder"
        options={{
          title: 'Share Photos',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="viewFolders"
        options={{
          title: 'View Folders',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />


    </Tabs>
  );
}
