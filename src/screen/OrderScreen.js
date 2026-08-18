import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '../../supabase';
import { COLORS } from '../constants/theme';

export default function OrderScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeSalesList, setActiveSalesList] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    const [selectedSales, setSelectedSales] = useState(null);
    const [stockModalVisible, setStockModalVisible] = useState(false);

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
        await Promise.all([getUserLocation(), fetchActiveSales(), fetchRecentOrders()]);
        setLoading(false);
        setRefreshing(false);
    };

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setUserLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                });
            }
        } catch (err) {
            console.log('Error get location:', err);
        }
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
                    is_open,
                    active_sales_id
                `)
                .eq('is_open', true);

            if (error) throw error;

            if (units && units.length > 0) {
                const formattedList = await Promise.all(
                    units.map(async (unit) => {
                        let salesName = unit.unit_name || 'Sales Kopi Ajoe';

                        if (unit.active_sales_id) {
                            const { data: userData } = await supabase
                                .from('users')
                                .select('name')
                                .eq('id', unit.active_sales_id)
                                .maybeSingle();

                            if (userData?.name) {
                                salesName = userData.name;
                            }
                        }

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
                            name: salesName,
                            location: `Gerobak ${unit.vehicle_type === 'sepeda' ? 'Sepeda' : 'Motor'}`,
                            latitude: parseFloat(unit.latitude) || -0.2292,
                            longitude: parseFloat(unit.longitude) || 100.6308,
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
                    sales_id
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const formattedOrders = await Promise.all(
                (data || []).map(async (ord) => {
                    let salesName = 'Sales Kopi Ajoe';

                    if (ord.sales_id) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('name')
                            .eq('id', ord.sales_id)
                            .maybeSingle();

                        if (userData?.name) {
                            salesName = userData.name;
                        }
                    }

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
                        salesName: salesName,
                        items: itemsText,
                        total: `Rp ${(ord.total_price || 0).toLocaleString('id-ID')}`,
                        status: ord.payment_status === 'success' ? 'Selesai' : ord.payment_status,
                    };
                })
            );

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

    const handleMarkerPress = (sales) => {
        setSelectedSales(sales);
        setStockModalVisible(true);
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

    const defaultRegion = userLocation || {
        latitude: -0.2292,
        longitude: 100.6308,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

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
                    <Text style={styles.headerTitle}>Peta Gerobak Kopi Ajoe 📍</Text>
                    <Text style={styles.headerSubtitle}>
                        Klik titik gerobak di peta untuk melihat posisi dan sisa stok kopi ready.
                    </Text>
                </View>

                <View style={styles.mapCardContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={defaultRegion}
                        showsUserLocation
                        showsMyLocationButton
                    >
                        {activeSalesList.map((sales) => (
                            <Marker
                                key={sales.id}
                                coordinate={{
                                    latitude: sales.latitude,
                                    longitude: sales.longitude,
                                }}
                                title={sales.name}
                                description="Sentuh untuk lihat stok ready"
                                onPress={() => handleMarkerPress(sales)}
                            />
                        ))}
                    </MapView>
                    <View style={styles.mapBadge}>
                        <Text style={styles.mapBadgeText}>
                            {activeSalesList.length} Gerobak Aktif Keliling
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Daftar Gerobak Buka 🔥</Text>

                {activeSalesList.length > 0 ? (
                    activeSalesList.map((sales) => (
                        <TouchableOpacity
                            key={sales.id}
                            style={styles.salesCard}
                            activeOpacity={0.85}
                            onPress={() => handleMarkerPress(sales)}
                        >
                            <View style={styles.salesHeader}>
                                <View style={styles.salesInfoLeft}>
                                    <Text style={styles.salesName}>{sales.name}</Text>
                                    <Text style={styles.salesLocation}>{sales.location}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusBadgeText}>Lihat Stok ›</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
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

            <Modal
                visible={stockModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setStockModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedSales && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={styles.modalSalesName}>{selectedSales.name}</Text>
                                        <Text style={styles.modalSalesLocation}>{selectedSales.location}</Text>
                                    </View>
                                    <View style={styles.statusBadgeActive}>
                                        <Text style={styles.statusBadgeActiveText}>Buka Lapak</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.mapsButton}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        openGoogleMaps(selectedSales.latitude, selectedSales.longitude, selectedSales.name)
                                    }
                                >
                                    <Text style={styles.mapsButtonText}>
                                        📍 Petunjuk Arah di Google Maps
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <Text style={styles.stockTitle}>Stok Minuman Ready Saat Ini:</Text>
                                <ScrollView style={{ maxHeight: 200, width: '100%' }}>
                                    {selectedSales.stock.length > 0 ? (
                                        selectedSales.stock.map((item, idx) => (
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
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.closeModalBtn}
                                    onPress={() => setStockModalVisible(false)}
                                >
                                    <Text style={styles.closeModalBtnText}>Tutup</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 130,
    },
    header: {
        marginBottom: 14,
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
    mapCardContainer: {
        width: '100%',
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
        elevation: 4,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: COLORS.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 3,
    },
    mapBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.primary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    salesCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
    },
    salesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    salesInfoLeft: {
        flex: 1,
    },
    salesName: {
        fontSize: 15,
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
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statusBadgeActive: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusBadgeActiveText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#2E7D32',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 14,
        width: '100%',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'flex-start',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 14,
    },
    modalSalesName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    modalSalesLocation: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    mapsButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    mapsButtonText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: '800',
    },
    stockTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    stockItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    stockDrinkName: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    stockCount: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    stockEmpty: {
        fontSize: 14,
        fontWeight: '800',
        color: '#E53E3E',
    },
    closeModalBtn: {
        marginTop: 20,
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
    },
    closeModalBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
});