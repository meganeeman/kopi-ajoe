import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../config/supabase';
import { COLORS } from '../constants/theme';

export default function OrderScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeSalesList, setActiveSalesList] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchData();

        const subscription = supabase
            .channel('public:cart_units')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cart_units' },
                () => {
                    fetchActiveSales();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchActiveSales(), fetchRecentOrders()]);
        setLoading(false);
        setRefreshing(false);
    };

    const fetchActiveSales = async () => {
        try {
            const { data: units, error } = await supabase
                .from('cart_units')
                .select(`
                    id,
                    unit_name,
                    vehicle_type,
                    latitude,
                    longitude,
                    is_online,
                    users:active_sales_id (
                        name
                    )
                `)
                .eq('is_online', true);

            if (error) throw error;

            if (units && units.length > 0) {
                const formattedList = await Promise.all(
                    units.map(async (unit) => {
                        const { data: stocksData } = await supabase
                            .from('cart_stocks')
                            .select(`
                                quantity,
                                products ( name )
                            `)
                            .eq('cart_unit_id', unit.id);

                        const formattedStocks = (stocksData || []).map((s) => ({
                            drink: s.products?.name || 'Kopi Ajoe',
                            ready: s.quantity || 0,
                        }));

                        return {
                            id: unit.id,
                            name: unit.users?.name || unit.unit_name || 'Sales Ajoe',
                            location: `Gerobak ${unit.vehicle_type || 'Keliling'}`,
                            latitude: unit.latitude || -0.2292,
                            longitude: unit.longitude || 100.6308,
                            status: 'Lapak Buka / Ready',
                            stock: formattedStocks,
                        };
                    })
                );

                setActiveSalesList(formattedList);
            } else {
                setActiveSalesList([]);
            }
        } catch (err) {
            console.log('Error fetch sales:', err);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    id,
                    created_at,
                    total_price,
                    total_cups,
                    payment_status,
                    items,
                    users:sales_id ( name )
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const formattedOrders = (data || []).map((ord) => {
                const itemsList = ord.items || [];
                const itemsText = itemsList.length > 0
                    ? itemsList.map(i => `${i.quantity}x ${i.name}`).join(', ')
                    : `${ord.total_cups || 1}x Cup Kopi Ajoe`;

                return {
                    id: ord.id,
                    date: new Date(ord.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    salesName: ord.users?.name || 'Sales Kopi Ajoe',
                    items: itemsText,
                    total: `Rp ${(ord.total_price || 0).toLocaleString('id-ID')}`,
                    status: ord.payment_status === 'success' ? 'Selesai' : ord.payment_status,
                };
            });

            setRecentOrders(formattedOrders);
        } catch (err) {
            console.log('Error fetch orders:', err);
        }
    };

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

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
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
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Cek Gerai & Stok Ready 📍</Text>
                    <Text style={styles.headerSubtitle}>
                        Lihat posisi sales terdekat dan stok kopi yang mereka bawa.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Sales Terdekat Online 🔥</Text>

                {activeSalesList.length > 0 ? (
                    activeSalesList.map((sales, index) => (
                        <View
                            key={sales.id}
                            style={index === 0 ? styles.salesCardPrimary : styles.salesCard}
                        >
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
                                onPress={() =>
                                    openGoogleMaps(sales.latitude, sales.longitude, sales.name)
                                }
                            >
                                <Text style={styles.mapsButtonText}>
                                    📍 Petunjuk Arah di Maps
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <Text style={styles.stockTitle}>Stok Minuman Ready:</Text>
                            <View style={styles.stockGrid}>
                                {sales.stock.length > 0 ? (
                                    sales.stock.map((item, idx) => (
                                        <View key={idx} style={styles.stockItem}>
                                            <Text style={styles.stockDrinkName}>{item.drink}</Text>
                                            <Text
                                                style={
                                                    item.ready > 0
                                                        ? styles.stockCount
                                                        : styles.stockEmpty
                                                }
                                            >
                                                {item.ready > 0 ? `${item.ready} Cup` : 'Habis'}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.stockDrinkName}>
                                        Belum ada stok terdaftar
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            Belum ada sales yang sedang keliling / Buka Lapak saat ini.
                        </Text>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                    Riwayat Minum Kopi ☕
                </Text>

                {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                        <View key={order.id} style={styles.orderHistoryCard}>
                            <View style={styles.orderHistoryHeader}>
                                <Text style={styles.orderDate}>{order.date}</Text>
                                <Text style={styles.orderStatusBadge}>{order.status}</Text>
                            </View>
                            <Text style={styles.orderSales}>
                                Beli di:{' '}
                                <Text style={styles.orderSalesBold}>{order.salesName}</Text>
                            </Text>
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
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
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
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    salesCardPrimary: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 2,
        borderColor: COLORS.primary,
        elevation: 3,
    },
    salesCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        color: COLORS.textPrimary,
    },
    salesLocation: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: COLORS.inputBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    mapsButton: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    mapsButtonText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },
    stockTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
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
        color: COLORS.textSecondary,
    },
    stockCount: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    stockEmpty: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E53E3E',
    },
    orderHistoryCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        marginBottom: 12,
    },
    orderHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    orderStatusBadge: {
        fontSize: 11,
        fontWeight: '800',
        color: '#2E7D32',
    },
    orderSales: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    orderSalesBold: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    orderItems: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    orderTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTotalLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    orderTotalValue: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    emptyCard: {
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
});