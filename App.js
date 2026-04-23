import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import ScannerScreen from './screens/ScannerScreen';
import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import PassportScreen from './screens/PassportScreen';

const Stack = createStackNavigator();

export default function App() {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile">
            {(props) => (
              <ProfileScreen
                {...props}
                selectedAllergies={selectedAllergies}
                setSelectedAllergies={setSelectedAllergies}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Scanner">
            {(props) => (
              <ScannerScreen
                {...props}
                selectedAllergies={selectedAllergies}
                setScanHistory={setScanHistory}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Chat">
            {(props) => (
              <ChatScreen
                {...props}
                selectedAllergies={selectedAllergies}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="History">
            {(props) => (
              <HistoryScreen
                {...props}
                scanHistory={scanHistory}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Emergency" component={EmergencyScreen} />
          <Stack.Screen name="Passport">
            {(props) => (
              <PassportScreen
                {...props}
                selectedAllergies={selectedAllergies}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
