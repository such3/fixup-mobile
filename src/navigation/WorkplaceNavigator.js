import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import StaffDashboard from '../screens/workplace/StaffDashboard';
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminIssueListScreen from '../screens/admin/AdminIssueListScreen';
import FeedbackListScreen from '../screens/admin/FeedbackListScreen';
import ReportListScreen from '../screens/admin/ReportListScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import EditUserScreen from '../screens/admin/EditUserScreen';
import EditIssueScreen from '../screens/admin/EditIssueScreen';
import ResolveIssueScreen from '../screens/workplace/ResolveIssueScreen';

const Stack = createNativeStackNavigator();

const WorkplaceNavigator = () => {
    const { user } = useContext(AuthContext);

    const isStaff = user?.role === 'staff';

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isStaff ? (
                <>
                    <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
                    <Stack.Screen name="ResolveIssue" component={ResolveIssueScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                    <Stack.Screen name="UserManagement" component={UserManagementScreen} />
                    <Stack.Screen name="AdminIssueList" component={AdminIssueListScreen} />
                    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                    <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
                    <Stack.Screen name="ReportList" component={ReportListScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default WorkplaceNavigator;
