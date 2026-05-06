import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Bot, Clock, User, Globe, Scan, Shield, Database, LayoutDashboard, Sparkles } from 'lucide-react-native';
import { auth, db } from './firebaseConfig';
import { ThemeProvider, useTheme } from './utils/ThemeContext';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import ScannerScreen from './screens/ScannerScreen';
import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import PassportScreen from './screens/PassportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomScannerButton = ({ children, onPress }) => {
  const { theme } = useTheme();
  return (
    <View style={{ top: -30, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable
        style={{
          width: 74,
          height: 74,
          borderRadius: 37,
          backgroundColor: theme.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 10,
          borderWidth: 4,
          borderColor: theme.bg
        }}
        onPress={onPress}
      >
        <Scan color="#FFF" size={32} />
      </Pressable>
    </View>
  );
};

function MainTabs({ user, selectedAllergies, setSelectedAllergies, scanHistory, setScanHistory }) {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          elevation: 10,
          backgroundColor: theme.tabBar,
          borderRadius: 25,
          height: 74,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
      }}
    >
      <Tab.Screen 
        name="Home" 
        options={{
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size + 2} />,
        }}
      >
        {(props) => (
          <HomeScreen 
            {...props} 
            user={user} 
            selectedAllergies={selectedAllergies} 
            setSelectedAllergies={setSelectedAllergies} 
            scanHistory={scanHistory} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="History" 
        options={{
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size + 2} />,
        }}
      >
        {(props) => <HistoryScreen {...props} user={user} scanHistory={scanHistory} />}
      </Tab.Screen>

      <Tab.Screen 
        name="ScannerTab" 
        component={View} 
        options={{
          tabBarButton: (props) => <CustomScannerButton {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Scanner');
          },
        })}
      />

      <Tab.Screen 
        name="Chat" 
        options={{
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size + 2} />,
        }}
      >
        {(props) => <ChatScreen {...props} user={user} selectedAllergies={selectedAllergies} />}
      </Tab.Screen>

      <Tab.Screen 
        name="Profile" 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size + 2} />,
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AdminTabs({ user, scanHistory, setScanHistory }) {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute', bottom: 30, left: 20, right: 20,
          elevation: 10, backgroundColor: theme.tabBar, borderRadius: 25, height: 74,
          borderTopWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3, shadowRadius: 20,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size + 2} />,
        }}
      >
        {(props) => <AdminDashboardScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen 
        name="ScannerTab" 
        component={View} 
        options={{
          tabBarButton: (props) => <CustomScannerButton {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Scanner');
          },
        })}
      />

      <Tab.Screen 
        name="Profile" 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size + 2} />,
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          let role = 'customer';
          if (userDoc.exists()) {
            role = userDoc.data().role || 'customer';
          }
          setUser({ ...authUser, role });
        } catch (error) {
          console.error("Error fetching role:", error);
          setUser({ ...authUser, role: 'customer' });
        }
      } else {
        setUser(null);
        setIsFullyAuthenticated(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer theme={{ colors: { background: theme.bg } }}>
      <Stack.Navigator 
        initialRouteName={user && isFullyAuthenticated ? (user.role === 'admin' ? "AdminTabs" : "MainTabs") : "Login"} 
        screenOptions={{ headerShown: false }}
      >
        {!user || !isFullyAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsFullyAuthenticated={setIsFullyAuthenticated} />}
          </Stack.Screen>
        ) : (
          <>
            {user.role === 'admin' ? (
              <Stack.Screen name="AdminTabs">
                {(props) => (
                  <AdminTabs 
                    {...props}
                    user={user}
                    scanHistory={scanHistory}
                    setScanHistory={setScanHistory}
                  />
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="MainTabs">
                {(props) => (
                  <MainTabs 
                    {...props}
                    user={user}
                    selectedAllergies={selectedAllergies}
                    setSelectedAllergies={setSelectedAllergies}
                    scanHistory={scanHistory}
                    setScanHistory={setScanHistory}
                  />
                )}
              </Stack.Screen>
            )}
            <Stack.Screen name="Scanner">
              {(props) => (
                <ScannerScreen
                  {...props}
                  user={user}
                  selectedAllergies={selectedAllergies}
                  setScanHistory={setScanHistory}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
            <Stack.Screen name="Passport">
              {(props) => (
                <PassportScreen
                  {...props}
                  user={user}
                  selectedAllergies={selectedAllergies}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
