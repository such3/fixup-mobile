import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';


// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import ComplaintDetailScreen from '../screens/main/ComplaintDetailScreen';
import EditIssueScreen from '../screens/admin/EditIssueScreen';
import EditUserScreen from '../screens/admin/EditUserScreen';
import AssignStaffScreen from '../screens/admin/AssignStaffScreen';
import CreateUserScreen from '../screens/admin/CreateUserScreen';


const Stack = createNativeStackNavigator();

import LandingScreen from '../screens/LandingScreen';

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    const [showLanding, setShowLanding] = React.useState(true);

    React.useEffect(() => {
        // Enforce minimum branding time (e.g. 2.5s)
        const timer = setTimeout(() => {
            setShowLanding(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    // Show Landing if enforcing timer OR if actual auth loading is still happening
    if (showLanding || loading) {
        return <LandingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Authenticated Stack
                    <Stack.Group>
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                        <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="EditIssue" component={EditIssueScreen} />
                        <Stack.Screen name="AssignStaff" component={AssignStaffScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="EditUser" component={EditUserScreen} />
                        <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ headerShown: false }} />
                    </Stack.Group>
                ) : (
                    // Auth Stack
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />

                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
