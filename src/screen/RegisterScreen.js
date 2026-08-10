import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { supabase } from '../../supabase';

export default function RegisterScreen({ onRegisterSuccess, goToLogin }) {
    const [screenStep, setScreenStep] = useState('signup');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [loading, setLoading] = useState(false);

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

            Alert.alert('Mode Demo', 'Kode OTP pendaftaran kamu adalah: 123456');
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
            <Text style={styles.brandTitle}>Kopi Ajoe</Text>

            {screenStep === 'signup' ? (
                <>
                    <Text style={styles.subtitle}>Join geng penikmat Kopi Ajoe!</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nama Lengkap"
                        placeholderTextColor="#A08A75"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username (Contoh: kopilover)"
                        placeholderTextColor="#A08A75"
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Alamat Email"
                        placeholderTextColor="#A08A75"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nomor HP (Contoh: 08123456789)"
                        placeholderTextColor="#A08A75"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password (Min. 8 char, Kapital, Simbol)"
                        placeholderTextColor="#A08A75"
                        autoCapitalize="none"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleSignUp} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Kirim OTP Pendaftaran</Text>}
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
                        placeholderTextColor="#A08A75"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otpToken}
                        onChangeText={setOtpToken}
                    />

                    <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleVerifyOTP} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Verifikasi & Buat Akun</Text>}
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
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 28,
        elevation: 6,
        shadowColor: '#4A2E19',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#4A2E19',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#8C705F',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#FAF5EF',
        borderWidth: 1.5,
        borderColor: '#EFE5DA',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#4A2E19',
        fontWeight: '500',
        marginBottom: 14,
    },
    otpInput: {
        fontSize: 20,
        letterSpacing: 6,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#4A2E19',
    },
    submitButton: {
        backgroundColor: '#4A2E19',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    submitText: {
        color: '#FFF8F0',
        fontSize: 15,
        fontWeight: '700',
    },
    linkButton: {
        marginTop: 18,
        alignItems: 'center',
    },
    linkText: {
        color: '#8C705F',
        fontSize: 13,
    },
    linkBold: {
        color: '#4A2E19',
        fontWeight: '700',
    },
});