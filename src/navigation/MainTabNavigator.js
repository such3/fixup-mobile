import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/main/DashboardScreen';
import NewComplaintScreen from '../screens/main/NewComplaintScreen';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AnimatedTrophyIcon from '../components/AnimatedTrophyIcon';
import { View, Text, TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();

// Temporary Icons (Text based for now to avoid vector-icons setup churn, but user wants premium so...)
// Actually exposing expo/vector-icons is default in expo.
import { Ionicons } from '@expo/vector-icons';

import WorkplaceNavigator from './WorkplaceNavigator';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MainTabNavigator = () => {
    const { user } = useContext(AuthContext);
    const hasWorkplaceAccess = ['admin', 'staff', 'deptHead'].includes(user?.role);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Feed') {
                        iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
                    } else if (route.name === 'New Issue') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Workplace') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                    marginHorizontal: 16,
                    marginBottom: 24,
                    borderRadius: 24,
                    position: 'absolute',
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                    backgroundColor: 'white'
                },
            })}
        >
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: "Home",
                    headerRight: () => (
                        <AnimatedTrophyIcon onPress={() => navigation.navigate('Leaderboard')} />
                    ),
                    headerStyle: {
                        backgroundColor: '#f8fafc',
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 24,
                        color: '#1e293b'
                    }
                })}
            />
            <Tab.Screen name="New Issue" component={NewComplaintScreen} />
            {hasWorkplaceAccess && (
                <Tab.Screen name="Workplace" component={WorkplaceNavigator} />
            )}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
