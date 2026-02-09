import { supabase } from "@/lib/supabase";

export interface BrandApplication {
    company_name: string;
    contact_name: string;
    email: string;
    website?: string;
    portfolio_url?: string;
    message?: string;
}

export const brandService = {
    /**
     * Submit a new brand application to the collective.
     */
    async applyToCollective(application: BrandApplication) {
        const { error } = await supabase
            .from('brand_applications')
            .insert([application]);

        if (error) throw error;
        return true;
    },

    /**
     * Fetch all active brands for the directory.
     */
    async getActiveBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('status', 'active');

        if (error) throw error;
        return data;
    },

    /**
     * Add a new email to the newsletter subscribers and send welcome email.
     */
    async subscribeToJournal(email: string) {
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (error) throw error;

        // "Journal Archival": Send the welcome email
        await supabase.functions.invoke('send-email', {
            body: {
                to: email,
                subject: "Welcome to the MENA ROYAL Journal",
                html: `
                    <div style="font-family: serif; max-width: 600px; padding: 40px; border: 1px solid #eee;">
                        <h1 style="font-weight: 300;">The <span style="font-style: italic;">Journal</span></h1>
                        <p style="font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Institutional Subscription Confirmed</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="font-size: 16px; line-height: 1.6;">Welcome to the MENA ROYAL collective archive. You will now receive seasonal curations from our heritage houses.</p>
                    </div>
                `
            }
        });

        return true;
    },

    /**
     * ADMIN: Fetch all applications for review.
     */
    async getApplications() {
        const { data, error } = await supabase
            .from('brand_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * ADMIN: Update application status.
     */
    async updateApplicationStatus(id: string, status: 'reviewing' | 'approved' | 'rejected') {
        const { error } = await supabase
            .from('brand_applications')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    /**
     * ADMIN: Create a skeletal brand record and link the designer by email.
     */
    async createBrandFromApplication(companyName: string, designerEmail: string) {
        const slug = companyName.toLowerCase().replace(/\s+/g, '-');

        const { data, error } = await supabase
            .from('brands')
            .insert([{
                name: companyName,
                slug: slug,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // "Atelier Sync": Link the designer profile using their email address
        await supabase
            .from('profiles')
            .update({
                brand_id: data.id,
                role: 'brand_admin'
            })
            .eq('email', designerEmail);

        return data;
    },
    /**
     * PUBLIC: Fetch a brand by its slug.
     */
    async getBrandBySlug(slug: string) {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    }
};
