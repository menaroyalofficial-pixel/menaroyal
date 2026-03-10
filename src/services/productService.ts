import { supabase } from "@/lib/supabase";

export interface ProductData {
    brand_id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category_id: string;
    materials?: string[];
    sizes?: string[];
    colors?: string[];
    stock: number;
    featured?: boolean;
}

export const productService = {
    /**
     * Fetch all products for a specific brand.
     */
    async getBrandProducts(brandId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Add a new piece to the brand's archive.
     */
    async addProduct(product: ProductData) {
        const slug = product.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        const { data, error } = await supabase
            .from('products')
            .insert([{
                ...product,
                slug
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a piece from the archive.
     */
    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    /**
     * Get brand analytics (simplified for now).
     */
    async getBrandStats(brandId: string) {
        const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('brand_id', brandId);

        return {
            totalProducts: products?.length || 0,
            totalSales: 0, // Will be linked to Orders table later
            profileViews: Math.floor(Math.random() * 500) + 100 // Simulated for now
        };
    },

    /**
     * PUBLIC: Fetch featured pieces for the home page.
     */
    async getFeaturedProducts(limit = 4) {
        const { data, error } = await supabase
            .from('products')
            .select('*, brands(name)')
            .eq('featured', true)
            .limit(limit);

        if (error) throw error;
        return data;
    },

    /**
     * PUBLIC: Fetch all products with extended filters.
     */
    async getProducts(filters: {
        categoryId?: string,
        brandId?: string,
        sortBy?: string,
        productType?: string,
        occasion?: string,
        origin?: string,
        page?: number,
        pageSize?: number
    }) {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 24;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('products')
            .select(`
                *,
                brands!inner (
                    name,
                    origin_country
                )
            `, { count: 'exact' });

        if (filters.categoryId && filters.categoryId !== 'all') {
            query = query.eq('category_id', filters.categoryId);
        }

        if (filters.brandId && filters.brandId !== 'all') {
            query = query.eq('brand_id', filters.brandId);
        }

        if (filters.productType) {
            query = query.eq('product_type', filters.productType);
        }

        if (filters.occasion) {
            query = query.contains('occasion_tags', [filters.occasion]);
        }

        if (filters.origin) {
            query = query.eq('brands.origin_country', filters.origin);
        }

        let orderColumn = 'featured';
        let orderAscending = false;

        switch (filters.sortBy) {
            case 'price-asc':
                orderColumn = 'price';
                orderAscending = true;
                break;
            case 'price-desc':
                orderColumn = 'price';
                orderAscending = false;
                break;
            case 'newest':
                orderColumn = 'created_at';
                orderAscending = false;
                break;
            default:
                orderColumn = 'featured';
                orderAscending = false;
                break;
        }

        query = query
            .order(orderColumn, { ascending: orderAscending })
            .range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        return { products: data || [], total: count || 0 };
    },

    /**
     * PUBLIC: Fetch the institutional category hierarchy.
     */
    /**
     * PUBLIC: Fetch a single product by its slug.
     */
    async getProductBySlug(slug: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*, brands(*)')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * PUBLIC: Fetch the institutional category hierarchy.
     */
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * PUBLIC: Fetch multiple products by their IDs.
     */
    async getProductsByIds(ids: string[]) {
        if (!ids || ids.length === 0) return [];
        const { data, error } = await supabase
            .from('products')
            .select('*, brands(name)')
            .in('id', ids);

        if (error) throw error;
        return data || [];
    }
};
