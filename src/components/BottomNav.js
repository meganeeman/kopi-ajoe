import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export default function BottomNav({ activeTab, setActiveTab }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 2500);
    };

    const handleCameraPress = () => {
        triggerToast('📷 Fitur Scan QR TBA ya!');
    };

    const handleRewardsPress = () => {
        triggerToast('🎁 Fitur Rewards akan segera hadir!');
    };

    return (
        <View style={styles.bottomNavWrapper}>
            {showToast && (
                <View style={styles.toastContainer}>
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            )}

            <View style={styles.bottomNavContainer}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setActiveTab('home')}
                >
                    <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>🏠</Text>
                    <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>
                        Home
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setActiveTab('order')}
                >
                    <Text style={[styles.navIcon, activeTab === 'order' && styles.navIconActive]}>☕</Text>
                    <Text style={[styles.navLabel, activeTab === 'order' && styles.navLabelActive]}>
                        Order
                    </Text>
                </TouchableOpacity>

                <View style={styles.cameraButtonPlaceholder}>
                    <TouchableOpacity
                        style={styles.cameraButton}
                        activeOpacity={0.85}
                        onPress={handleCameraPress}
                    >
                        <Text style={styles.cameraIcon}>📷</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={handleRewardsPress}
                >
                    <Text style={styles.navIcon}>🎁</Text>
                    <Text style={styles.navLabel}>Rewards</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setActiveTab('profile')}
                >
                    <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
                    <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
                        Profile
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNavWrapper: {
        position: 'absolute',
        bottom: 35,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    toastContainer: {
        position: 'absolute',
        top: -50,
        backgroundColor: COLORS.toastBg,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        zIndex: 9999,
    },
    toastText: {
        color: COLORS.toastText,
        fontSize: 12,
        fontWeight: '700',
    },
    bottomNavContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 30,
        height: 65,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navIcon: {
        fontSize: 18,
        opacity: 0.4,
    },
    navIconActive: {
        opacity: 1,
    },
    navLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    navLabelActive: {
        color: COLORS.textPrimary,
        fontWeight: '800',
    },
    cameraButtonPlaceholder: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraButton: {
        position: 'absolute',
        top: -20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.background,
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    cameraIcon: {
        fontSize: 22,
    },
});