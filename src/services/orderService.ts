import { supabase } from "@/lib/supabase";

export interface OrderData {
    customer_id?: string;
    customer_email: string;
    total_amount: number;
    platform_fee: number;
    shipping_address: any;
    items: {
        product_id: string;
        brand_id: string;
        quantity: number;
        price_at_purchase: number;
    }[];
}

export const orderService = {
    /**
     * Archive a new acquisition in the global registry.
     */
    async createOrder(order: OrderData) {
        // 1. Insert the main order record
        const { data: orderRecord, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id: order.customer_id,
                customer_email: order.customer_email,
                total_amount: order.total_amount,
                platform_fee: order.platform_fee,
                shipping_address: order.shipping_address,
                status: 'paid'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insert the individual archival items
        const orderItems = order.items.map(item => ({
            order_id: orderRecord.id,
            product_id: item.product_id,
            brand_id: item.brand_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            shipping_status: 'pending'
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return orderRecord;
    },

    /**
     * Fetch the acquisition history for a specific patron.
     */
    async getCustomerOrders(customerId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (
                        name,
                        images
                    ),
                    brands (
                        name
                    )
                )
            `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Fetch all brand-specific orders for fulfillment.
     */
    async getBrandOrders(brandId: string) {
        const { data, error } = await supabase
            .from('order_items')
            .select(`
                *,
                orders (*),
                products (name, images)
            `)
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Update the logistics status of an archival item.
     */
    async updateItemStatus(itemId: string, status: string, trackingNumber?: string) {
        const { data, error } = await supabase
            .from('order_items')
            .update({
                shipping_status: status,
                tracking_number: trackingNumber
            })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * ADMIN: Fetch the complete global acquisition ledger.
     */
    async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (name),
                    brands (name)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
