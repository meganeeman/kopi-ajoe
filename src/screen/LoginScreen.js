import React, { useState } from 'react';
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
    StatusBar
} from 'react-native';
import { supabase } from '../../supabase';

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
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
                            placeholderTextColor="#A89284"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#A89284"
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
        backgroundColor: '#FFF8F0',
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
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#4A2E19',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#EFE5DA',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#4A2E19',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#8C705F',
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
        backgroundColor: '#FAF5EF',
        borderRadius: 16,
        paddingHorizontal: 18,
        fontSize: 14,
        color: '#4A2E19',
        borderWidth: 1,
        borderColor: '#EFE5DA',
    },
    button: {
        width: '100%',
        height: 52,
        backgroundColor: '#4A2E19',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#8C705F',
    },
    buttonText: {
        color: '#FFF8F0',
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
        color: '#8C705F',
    },
    registerLink: {
        color: '#4A2E19',
        fontWeight: '800',
        fontSize: 12,
    },
});