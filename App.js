import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from './supabase';
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import HomeScreen from './src/screen/HomeScreen';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };

    checkInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUserSession(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const { data } = await supabase
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
        <ActivityIndicator size="large" color={COLORS.primary} />
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
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});