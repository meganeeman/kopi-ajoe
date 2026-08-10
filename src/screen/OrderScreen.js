import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert
} from 'react-native';

export default function OrderScreen() {
    const activeSalesList = [
        {
            id: '1',
            name: 'Ajoe Akbar',
            location: 'Area Lapangan Merdeka (±200m)',
            latitude: -0.2245,
            longitude: 100.6315,
            status: 'Keliling / Standby',
            stock: [
                { drink: 'Kopi Susu Aren', ready: 15 },
                { drink: 'Iced Americano', ready: 10 },
                { drink: 'Caramel Latte', ready: 5 },
            ],
        },
        {
            id: '2',
            name: 'Rian Kopi',
            location: 'Depan Stasiun Kota (±800m)',
            latitude: -0.2280,
            longitude: 100.6350,
            status: 'Standby',
            stock: [
                { drink: 'Kopi Susu Aren', ready: 8 },
                { drink: 'Iced Americano', ready: 12 },
                { drink: 'Caramel Latte', ready: 0 },
            ],
        },
    ];

    const recentOrders = [
        {
            id: 'ord-101',
            date: 'Hari ini, 10:15 WIB',
            salesName: 'Ajoe Akbar',
            items: '1x Kopi Susu Aren',
            total: 'Rp 18.000',
            status: 'Selesai',
        },
    ];

    const openGoogleMaps = (lat, lng, name) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Tidak dapat membuka Google Maps');
                }
            })
            .catch((err) => Alert.alert('Error', err.message));
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Cek Gerai & Stok Ready 📍</Text>
                    <Text style={styles.headerSubtitle}>Lihat posisi sales terdekat dan stok kopi yang mereka bawa.</Text>
                </View>

                <Text style={styles.sectionTitle}>Sales Terdekat Online 🔥</Text>

                {activeSalesList.map((sales) => (
                    <View key={sales.id} style={sales.id === '1' ? styles.salesCardPrimary : styles.salesCard}>
                        <View style={styles.salesHeader}>
                            <View style={styles.salesInfoLeft}>
                                <Text style={styles.salesName}>{sales.name}</Text>
                                <Text style={styles.salesLocation}>{sales.location}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusBadgeText}>{sales.status}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.mapsButton}
                            activeOpacity={0.8}
                            onPress={() => openGoogleMaps(sales.latitude, sales.longitude, sales.name)}
                        >
                            <Text style={styles.mapsButtonText}>📍 Petunjuk Arah di Maps</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <Text style={styles.stockTitle}>Stok Minuman Ready:</Text>
                        <View style={styles.stockGrid}>
                            {sales.stock.map((item, idx) => (
                                <View key={idx} style={styles.stockItem}>
                                    <Text style={styles.stockDrinkName}>{item.drink}</Text>
                                    <Text style={item.ready > 0 ? styles.stockCount : styles.stockEmpty}>
                                        {item.ready > 0 ? `${item.ready} Cup` : 'Habis'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Riwayat Minum Kopi ☕</Text>

                {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                        <View key={order.id} style={styles.orderHistoryCard}>
                            <View style={styles.orderHistoryHeader}>
                                <Text style={styles.orderDate}>{order.date}</Text>
                                <Text style={styles.orderStatusBadge}>{order.status}</Text>
                            </View>
                            <Text style={styles.orderSales}>Beli di: <Text style={styles.orderSalesBold}>{order.salesName}</Text></Text>
                            <Text style={styles.orderItems}>{order.items}</Text>
                            <View style={styles.divider} />
                            <View style={styles.orderTotalRow}>
                                <Text style={styles.orderTotalLabel}>Total Bayar</Text>
                                <Text style={styles.orderTotalValue}>{order.total}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Belum ada riwayat pesanan.</Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F0',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#4A2E19',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#8C705F',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4A2E19',
        marginBottom: 12,
    },
    salesCardPrimary: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 2,
        borderColor: '#D4A373',
        elevation: 3,
    },
    salesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#EFE5DA',
        elevation: 2,
    },
    salesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    salesInfoLeft: {
        flex: 1,
        paddingRight: 8,
    },
    salesName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4A2E19',
    },
    salesLocation: {
        fontSize: 12,
        color: '#8C705F',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#FAF5EF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#EFE5DA',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D4A373',
    },
    mapsButton: {
        backgroundColor: '#FAF5EF',
        borderWidth: 1,
        borderColor: '#D4A373',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    mapsButtonText: {
        color: '#4A2E19',
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#EFE5DA',
        marginVertical: 12,
    },
    stockTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A2E19',
        marginBottom: 8,
    },
    stockGrid: {
        gap: 6,
    },
    stockItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockDrinkName: {
        fontSize: 13,
        color: '#8C705F',
    },
    stockCount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A2E19',
    },
    stockEmpty: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E53E3E',
    },
    orderHistoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#EFE5DA',
        elevation: 2,
    },
    orderHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderDate: {
        fontSize: 12,
        color: '#8C705F',
    },
    orderStatusBadge: {
        fontSize: 11,
        fontWeight: '800',
        color: '#2E7D32',
    },
    orderSales: {
        fontSize: 13,
        color: '#8C705F',
        marginBottom: 2,
    },
    orderSalesBold: {
        color: '#4A2E19',
        fontWeight: '700',
    },
    orderItems: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A2E19',
    },
    orderTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTotalLabel: {
        fontSize: 13,
        color: '#8C705F',
    },
    orderTotalValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#4A2E19',
    },
    emptyCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8C705F',
        fontSize: 13,
    },
});