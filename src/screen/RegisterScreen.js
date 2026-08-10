import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Keyboard,
    Animated
} from 'react-native';
import { supabase } from '../../supabase';
import { COLORS } from '../constants/theme';

export default function RegisterScreen({ onRegisterSuccess, goToLogin }) {
    const [screenStep, setScreenStep] = useState('signup');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [loading, setLoading] = useState(false);

    const [toastMessage, setToastMessage] = useState('');
    const slideAnim = useRef(new Animated.Value(-100)).current;

    const showToast = (message) => {
        setToastMessage(message);
        Animated.sequence([
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(4000),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleSignUp = async () => {
        Keyboard.dismiss();
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim().toLowerCase();
        const cleanName = name.trim();
        const cleanPhone = phoneNumber.trim();
        const cleanPassword = password.trim();

        if (!cleanName || !cleanUsername || !cleanEmail || !cleanPhone || !cleanPassword) {
            Alert.alert('Eits', 'Semua kolom pendaftaran wajib diisi ya!');
            return;
        }

        const minLength = cleanPassword.length >= 8;
        const hasCapital = /[A-Z]/.test(cleanPassword);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(cleanPassword);

        if (!minLength || !hasCapital || !hasSymbol) {
            Alert.alert(
                'Password Kurang Kuat',
                'Password harus memenuhi syarat berikut:\n• Minimal 8 Karakter\n• Memiliki minimal 1 Huruf Kapital (A-Z)\n• Memiliki minimal 1 Simbol (!@#$%^&* dll)'
            );
            return;
        }

        setLoading(true);

        try {
            const { data: existingUsers } = await supabase
                .from('users')
                .select('id')
                .or(`email.eq.${cleanEmail},username.eq.${cleanUsername},phone_number.eq.${cleanPhone}`);

            if (existingUsers && existingUsers.length > 0) {
                Alert.alert('Sudah Terdaftar', 'Email, Username, atau Nomor HP ini sudah dipakai!');
                setLoading(false);
                return;
            }

            showToast('Untuk demo silahkan masukan 123456 sebagai kode OTP');
            setScreenStep('otp');
        } catch (err) {
            Alert.alert('Gagal Daftar', err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        Keyboard.dismiss();
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim().toLowerCase();
        const cleanName = name.trim();
        const cleanPhone = phoneNumber.trim();
        const cleanPassword = password.trim();
        const cleanOtp = otpToken.trim();

        if (!cleanOtp) {
            Alert.alert('Eits', 'Masukkan kode OTP dulu ya!');
            return;
        }

        if (cleanOtp !== '123456') {
            Alert.alert('OTP Salah', 'Kode OTP yang kamu masukkan salah! Gunakan 123456 untuk demo.');
            return;
        }

        setLoading(true);

        try {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([
                    {
                        email: cleanEmail,
                        name: cleanName,
                        username: cleanUsername,
                        phone_number: cleanPhone,
                        password: cleanPassword,
                        role: 'customer',
                        loyalty_points: 0,
                    },
                ])
                .select()
                .single();

            if (createError) throw createError;

            Alert.alert('Berhasil!', 'Akun kamu berhasil dibuat! Silakan login.');
            onRegisterSuccess(newUser);
        } catch (err) {
            Alert.alert('Gagal Verifikasi', err.message || 'Terjadi kesalahan saat membuat akun.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>

            <Text style={styles.brandTitle}>Kopi Ajoe</Text>

            {screenStep === 'signup' ? (
                <>
                    <Text style={styles.subtitle}>Join geng penikmat Kopi Ajoe!</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nama Lengkap"
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username (Contoh: kopilover)"
                        placeholderTextColor={COLORS.textPlaceholder}
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Alamat Email"
                        placeholderTextColor={COLORS.textPlaceholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nomor HP (Contoh: 08123456789)"
                        placeholderTextColor={COLORS.textPlaceholder}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password (Min. 8 char, Kapital, Simbol)"
                        placeholderTextColor={COLORS.textPlaceholder}
                        autoCapitalize="none"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleSignUp} disabled={loading}>
                        {loading ? <ActivityIndicator color={COLORS.textLight} /> : <Text style={styles.submitText}>Kirim OTP Pendaftaran</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkButton} onPress={goToLogin}>
                        <Text style={styles.linkText}>Sudah punya akun? <Text style={styles.linkBold}>Login di sini</Text></Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.subtitle}>Masukkan kode OTP yang dikirim ke {email}</Text>

                    <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="KODE OTP 6 ANGKA"
                        placeholderTextColor={COLORS.textPlaceholder}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otpToken}
                        onChangeText={setOtpToken}
                    />

                    <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleVerifyOTP} disabled={loading}>
                        {loading ? <ActivityIndicator color={COLORS.textLight} /> : <Text style={styles.submitText}>Verifikasi & Buat Akun</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkButton} onPress={() => setScreenStep('signup')} disabled={loading}>
                        <Text style={styles.linkText}>← Kembali ke Pendaftaran</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 28,
        padding: 28,
        elevation: 6,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        backgroundColor: COLORS.toastBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
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
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    input: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
        marginBottom: 14,
    },
    otpInput: {
        fontSize: 20,
        letterSpacing: 6,
        textAlign: 'center',
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    submitText: {
        color: COLORS.textLight,
        fontSize: 15,
        fontWeight: '700',
    },
    linkButton: {
        marginTop: 18,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    linkBold: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
});