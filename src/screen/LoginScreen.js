import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Animated
} from 'react-native';
import * as Updates from 'expo-updates';
import { supabase } from '../../supabase';
import { COLORS } from '../constants/theme';

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [toastMessage, setToastMessage] = useState('');
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        checkUpdateOnLogin();
    }, []);

    const showToast = (message) => {
        setToastMessage(message);
        Animated.sequence([
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(3000),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const checkUpdateOnLogin = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                showToast('Update baru ditemukan, mengunduh...');
                await Updates.fetchUpdateAsync();
                showToast('Aplikasi berhasil diperbarui!');
                setTimeout(async () => {
                    await Updates.reloadAsync();
                }, 1200);
            }
        } catch (error) {
            console.log('Update Error on Login:', error);
        }
    };

    const handleLogin = async () => {
        const inputClean = identifier ? identifier.trim().toLowerCase() : '';
        const passClean = password ? password.trim() : '';

        if (!inputClean || !passClean) {
            Alert.alert('Gagal', 'Silakan isi username/email/no HP dan password kamu.');
            return;
        }

        setLoading(true);
        try {
            const { data: userData, error: userErr } = await supabase
                .from('users')
                .select('*')
                .or(`email.eq.${inputClean},username.eq.${inputClean},phone_number.eq.${inputClean}`)
                .maybeSingle();

            if (userErr || !userData) {
                Alert.alert('Gagal Login', 'Akun tidak ditemukan. Cek kembali username/email/no HP kamu.');
                setLoading(false);
                return;
            }

            if (userData.password !== passClean) {
                Alert.alert('Gagal Login', 'Password yang kamu masukkan salah.');
                setLoading(false);
                return;
            }

            const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
                email: userData.email,
                password: passClean,
            });

            if (authErr) {
                Alert.alert('Gagal Auth', authErr.message);
                setLoading(false);
                return;
            }

            onLoginSuccess(userData);
        } catch (err) {
            console.log('Exception Catch:', err);
            Alert.alert('Error', err.message || 'Terjadi kesalahan sistem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>Kopi Ajoe</Text>
                    <Text style={styles.subtitle}>Satu seruput, sejuta cerita. Masuk yuk!</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username, Email, atau No HP"
                            placeholderTextColor={COLORS.textPlaceholder}
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={COLORS.textPlaceholder}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        activeOpacity={0.8}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Memproses...' : 'Masuk Sekarang'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Belum punya akun? </Text>
                        <TouchableOpacity onPress={onNavigateToRegister}>
                            <Text style={styles.registerLink}>Daftar dulu di sini</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        backgroundColor: COLORS.toastBg,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    toastText: {
        color: COLORS.toastText,
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 14,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: COLORS.inputBg,
        borderRadius: 14,
        paddingHorizontal: 18,
        fontSize: 14,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    button: {
        width: '100%',
        height: 52,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
    },
    buttonDisabled: {
        backgroundColor: COLORS.primaryDisabled,
    },
    buttonText: {
        color: COLORS.textLight,
        fontSize: 15,
        fontWeight: '800',
    },
    footerContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    registerLink: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 12,
    },
});