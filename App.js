import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { supabase } from './supabase';
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import HomeScreen from './src/screen/HomeScreen';

export default function App() {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    onFetchUpdateAsync();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUserSession(null);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const onFetchUpdateAsync = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Update Tersedia!',
          'Aplikasi berhasil diperbarui. Memuat ulang aplikasi...',
          [
            {
              text: 'OK',
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log('Update Error:', error);
    }
  };

  const fetchUserProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUserSession(data);
      } else {
        setUserSession(authUser);
      }
    } catch (err) {
      setUserSession(authUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserSession(null);
    setIsRegistering(false);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A2E19" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userSession ? (
        <HomeScreen
          userSession={userSession}
          onLogout={handleLogout}
        />
      ) : isRegistering ? (
        <RegisterScreen
          goToLogin={() => setIsRegistering(false)}
          onRegisterSuccess={(sessionData) => {
            setUserSession(sessionData);
            setIsRegistering(false);
          }}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(sessionData) => setUserSession(sessionData)}
          onNavigateToRegister={() => setIsRegistering(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
});