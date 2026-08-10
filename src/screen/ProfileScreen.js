import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function ProfileScreen({ userSession }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const APP_VERSION = 'v0.0.3';

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
                            color="#4A2E19"
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
        backgroundColor: '#FFF8F0',
    },
    toastContainer: {
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        backgroundColor: '#4A2E19',
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
        color: '#FFF8F0',
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
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#4A2E19',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    avatarCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#4A2E19',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF8F0',
    },
    nameText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#4A2E19',
        marginBottom: 2,
    },
    usernameText: {
        fontSize: 14,
        color: '#8C705F',
        fontWeight: '500',
        marginBottom: 10,
    },
    badgeContainer: {
        backgroundColor: '#FAF5EF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFE5DA',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#D4A373',
        letterSpacing: 1,
    },
    qrCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: '#EFE5DA',
        elevation: 2,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4A2E19',
        marginBottom: 4,
    },
    qrSubtitle: {
        fontSize: 12,
        color: '#8C705F',
        textAlign: 'center',
        marginBottom: 16,
    },
    qrWrapper: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EFE5DA',
        marginBottom: 10,
    },
    qrCodeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D4A373',
        letterSpacing: 1,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#4A2E19',
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
        color: '#8C705F',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 13,
        color: '#4A2E19',
        fontWeight: '700',
    },
    infoValueHighlight: {
        fontSize: 14,
        color: '#D4A373',
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#EFE5DA',
        marginVertical: 10,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    menuText: {
        fontSize: 14,
        color: '#4A2E19',
        fontWeight: '600',
    },
    arrowText: {
        fontSize: 16,
        color: '#8C705F',
        fontWeight: '700',
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8C705F',
        opacity: 0.7,
    },
});