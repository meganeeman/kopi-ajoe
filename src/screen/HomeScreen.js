import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
    SafeAreaView,
    StatusBar,
    Platform,
    Modal
} from 'react-native';
import { supabase } from '../../supabase';
import BottomNav from '../components/BottomNav';
import ProfileScreen from './ProfileScreen';
import OrderScreen from './OrderScreen';
import { COLORS } from '../constants/theme';

export default function HomeScreen({ userSession, onLogout }) {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours >= 0 && hours < 11) {
            return 'Selamat Pagi, ☀️';
        } else if (hours >= 11 && hours < 15) {
            return 'Selamat Siang, ☀️';
        } else if (hours >= 15 && hours < 18) {
            return 'Selamat Sore, ☕';
        } else {
            return 'Selamat Malam, 🌙';
        }
    };

    const productCatalog = [
        {
            id: '1',
            name: 'Strong Ajoe',
            price: 'Rp 13.000',
            category: 'Coffee Series',
            image: require('../../assets/STRONG.png'),
            description: 'Double shot espresso dengan karakter kopi yang lebih tebal dan nendang. Cocok untuk pencinta kopi yang butuh kafein ekstra.',
        },
        {
            id: '2',
            name: 'Soft Ajoe',
            price: 'Rp 13.000',
            category: 'Coffee Series',
            image: require('../../assets/SOFT.png'),
            description: 'Single shot espresso dengan perpaduan susu dan gula aren yang seimbang. Lembut dan ringan untuk dinikmati.',
        },
        {
            id: '3',
            name: 'Butter Ajoe',
            price: 'Rp 13.000',
            category: 'Coffee Series',
            image: require('../../assets/BUTTER.png'),
            description: 'Perpaduan kopi pilihan, susu creamy, dan aroma butter yang lembut. Rasa khas yang hanya bisa ditemukan di Kopi Ajoe.',
        },
        {
            id: '4',
            name: 'Americano Mixed Berry',
            price: 'Rp 13.000',
            category: 'Coffee Series',
            image: require('../../assets/AMERICANO.png'),
            description: 'Espresso berpadu dengan selai berry yang segar. Tanpa susu dan krimer, menghadirkan rasa fruity americano yang lebih menyegarkan.',
        },
        {
            id: '5',
            name: 'Es Chocolate Ajoe',
            price: 'Rp 13.000',
            category: 'Non Coffee Series',
            image: require('../../assets/CHOCOLATE.png'),
            description: 'Cokelat dingin yang creamy dengan cita rasa cokelat yang lebih tebal. Nikmat dipadukan dengan roti.',
        },
        {
            id: '6',
            name: 'Es Green Tea Ajoe',
            price: 'Rp 13.000',
            category: 'Non Coffee Series',
            image: require('../../assets/MATCHA.png'),
            description: 'Perpaduan green tea dan susu dengan karakter creamy yang menyegarkan.',
        },
        {
            id: '7',
            name: 'Es Mangga Ajoe',
            price: 'Rp 13.000',
            category: 'Non Coffee Series',
            image: require('../../assets/MANGGA.png'),
            description: 'Mangga segar dengan rasa juicy & manis yang pas, serta aroma buah yang khas. Dilengkapi bulir mangga asli serta jelly yang lembut.',
        },
        {
            id: '8',
            name: 'Roti Ajoe',
            price: 'Rp 3.000',
            category: 'Food',
            image: require('../../assets/ROTI.png'),
            description: 'Roti lembut dengan aroma butter yang harum dan khas. Cocok dipadukan dengan kopi & es chocolate ajoe.',
        },
    ];

    const handleOpenDetail = (product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <View style={styles.dashboardContainer}>
                {activeTab === 'profile' && (
                    <ProfileScreen userSession={userSession} onLogout={onLogout} />
                )}

                {activeTab === 'order' && (
                    <OrderScreen />
                )}

                {activeTab === 'home' && (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        <View style={styles.header}>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.greetingText}>{getGreeting()}</Text>
                                <Text style={styles.userNameText}>{userSession?.name || 'Coffee Lover'}</Text>
                            </View>
                            <TouchableOpacity style={styles.profileBadge} onPress={handleLogout}>
                                <Text style={styles.logoutBadgeText}>Keluar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.loyaltyCard}>
                            <View style={styles.loyaltyHeader}>
                                <View>
                                    <Text style={styles.starCount}>
                                        {userSession?.loyalty_points || 0} <Text style={styles.starUnit}>Stars</Text>
                                    </Text>
                                    <Text style={styles.starSubtitle}>Tingkatkan poin buat dapet Kopi Gratis!</Text>
                                </View>
                                <TouchableOpacity style={styles.scanButton} onPress={() => setActiveTab('profile')}>
                                    <Text style={styles.scanButtonText}>Buka QR</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.progressTrack}>
                                <View style={[styles.progressBar, { width: `${Math.min((userSession?.loyalty_points || 0) * 10, 100)}%` }]} />
                            </View>
                            <View style={styles.progressLabels}>
                                <Text style={styles.progressText}>0 Stars</Text>
                                <Text style={styles.progressText}>300 Stars (Free Coffee)</Text>
                            </View>
                        </View>

                        <View style={styles.promoBanner}>
                            <Text style={styles.promoTag}>LIMITED OFFER</Text>
                            <Text style={styles.promoTitle}>Paket Kopi Ajoe dan Roti Rotte hanya Rp16.000</Text>
                            <Text style={styles.promoSubtitle}>Khusus pembelian di gerobak Kopi Ajoe terdekat.</Text>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Menu Kopi Ajoe 🔥</Text>
                            <TouchableOpacity onPress={() => setActiveTab('order')}><Text style={styles.seeAllText}>Cek Stok Sales</Text></TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.drinksScrollView}>
                            {productCatalog.map((drink) => (
                                <TouchableOpacity
                                    key={drink.id}
                                    style={styles.drinkCard}
                                    activeOpacity={0.8}
                                    onPress={() => handleOpenDetail(drink)}
                                >
                                    <Image source={drink.image} style={styles.drinkImage} resizeMode="cover" />
                                    <Text style={styles.drinkName} numberOfLines={1}>{drink.name}</Text>
                                    <Text style={styles.drinkPrice}>{drink.price}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                    </ScrollView>
                )}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {selectedProduct && (
                                <>
                                    <Image source={selectedProduct.image} style={styles.modalImage} resizeMode="contain" />
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>{selectedProduct.category}</Text>
                                    </View>
                                    <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                                    <Text style={styles.modalPrice}>{selectedProduct.price}</Text>
                                    <Text style={styles.modalDescription}>{selectedProduct.description}</Text>

                                    <TouchableOpacity
                                        style={styles.checkStockButton}
                                        onPress={() => {
                                            setModalVisible(false);
                                            setActiveTab('order');
                                        }}
                                    >
                                        <Text style={styles.checkStockText}>📍 Cek Stok di Sales Terdekat</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.closeText}>Tutup</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 12,
    },
    dashboardContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 130,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    greetingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    userNameText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    profileBadge: {
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    logoutBadgeText: {
        color: '#E53E3E',
        fontSize: 12,
        fontWeight: '700',
    },
    loyaltyCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    loyaltyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    starCount: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.textLight,
    },
    starUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    starSubtitle: {
        fontSize: 12,
        color: '#CCCCCC',
        marginTop: 2,
    },
    scanButton: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },
    scanButtonText: {
        color: COLORS.textPrimary,
        fontWeight: '800',
        fontSize: 13,
    },
    progressTrack: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.textLight,
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 11,
        color: '#CCCCCC',
        fontWeight: '500',
    },
    promoBanner: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    promoTag: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 1,
        marginBottom: 4,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    promoSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    seeAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    drinksScrollView: {
        marginLeft: -4,
    },
    drinkCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 12,
        marginRight: 14,
        width: 140,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    drinkImage: {
        width: '100%',
        height: 100,
        borderRadius: 14,
        backgroundColor: COLORS.inputBg,
        marginBottom: 10,
    },
    drinkName: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    drinkPrice: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalImage: {
        width: 120,
        height: 120,
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: COLORS.inputBg,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 8,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 0.5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 2,
        textAlign: 'center',
    },
    modalPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    checkStockButton: {
        backgroundColor: COLORS.primary,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    checkStockText: {
        color: COLORS.textLight,
        fontWeight: '800',
        fontSize: 13,
    },
    closeButton: {
        paddingVertical: 10,
    },
    closeText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '700',
    },
});