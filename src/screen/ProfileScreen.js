import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';

export default function ProfileScreen({ userSession }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const APP_VERSION = 'v0.0.4';

    const handleMenuPress = (menuName) => {
        setToastMessage(`✨ Fitur ${menuName} (TBD) akan segera hadir! ✨`);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 2500);
    };

    const qrData = JSON.stringify({
        id: userSession?.id,
        username: userSession?.username,
        name: userSession?.name,
    });

    return (
        <View style={styles.container}>
            {showToast && (
                <View style={styles.toastContainer}>
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {userSession?.name ? userSession.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                    <Text style={styles.nameText}>{userSession?.name || 'Customer'}</Text>
                    <Text style={styles.usernameText}>@{userSession?.username || 'username'}</Text>

                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>CUSTOMER MEMBER</Text>
                    </View>
                </View>

                <View style={styles.qrCard}>
                    <Text style={styles.qrTitle}>QR ID Member Kamu</Text>
                    <Text style={styles.qrSubtitle}>Tunjukkan QR ini ke Sales/Barista buat kumpulin poin!</Text>

                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={qrData || 'UNKNOWN_USER'}
                            size={160}
                            color={COLORS.primary}
                            backgroundColor="#FFFFFF"
                        />
                    </View>
                    <Text style={styles.qrCodeText}>ID: {userSession?.username || 'GUEST'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Informasi Akun</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email / Telepon</Text>
                        <Text style={styles.infoValue}>{userSession?.phone_number || '-'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Poin Loyalty</Text>
                        <Text style={styles.infoValueHighlight}>{userSession?.loyalty_points || 0} Pts</Text>
                    </View>
                </View>

                <View style={styles.menuCard}>
                    <Text style={styles.sectionTitle}>Pengaturan & Bantuan</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Edit Profil')}>
                        <Text style={styles.menuText}>Edit Profil</Text>
                        <Text style={styles.arrowText}>{'>'}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Pusat Bantuan')}>
                        <Text style={styles.menuText}>Pusat Bantuan</Text>
                        <Text style={styles.arrowText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Kopi Ajoe App • {APP_VERSION}</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    toastContainer: {
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        backgroundColor: COLORS.toastBg,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        zIndex: 999,
    },
    toastText: {
        color: COLORS.toastText,
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 130,
    },
    headerCard: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textLight,
    },
    nameText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    usernameText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginBottom: 10,
    },
    badgeContainer: {
        backgroundColor: COLORS.inputBg,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 1,
    },
    qrCard: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    qrSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    qrWrapper: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
    },
    qrCodeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: 1,
    },
    infoCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 14,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 13,
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    infoValueHighlight: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 10,
    },
    menuCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    menuText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    arrowText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        opacity: 0.7,
    },
});