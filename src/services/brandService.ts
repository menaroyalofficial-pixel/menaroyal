import { supabase } from "@/lib/supabase";

export interface BrandApplication {
    company_name: string;
    contact_name: string;
    email: string;
    website?: string;
    portfolio_url?: string;
    message?: string;
}

export interface FoundingHouseApplication {
    contact_name: string;
    company_name: string;
    country: string;
    instagram: string;
    website: string;
    categories: string[];
    price_range: string;
    email: string;
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
     * Founding-house application (Apply page). Saved in brand_applications.
     * If the database has not received the new columns yet, the details are
     * kept in the message field so nothing is lost.
     */
    async applyAsFoundingHouse(a: FoundingHouseApplication) {
        const row = {
            company_name: a.company_name.trim(),
            contact_name: a.contact_name.trim(),
            email: a.email.trim().toLowerCase(),
            website: a.website.trim() || null,
            portfolio_url: a.instagram.trim() || null,
            country: a.country,
            instagram: a.instagram.trim(),
            categories: a.categories,
            price_range: a.price_range,
            application_type: 'founding_house',
        };
        const { error } = await supabase.from('brand_applications').insert([row]);
        if (!error) return true;
        if (error.code !== 'PGRST204' && !/column/i.test(error.message)) throw error;
        const { error: fallbackError } = await supabase.from('brand_applications').insert([{
            company_name: row.company_name,
            contact_name: row.contact_name,
            email: row.email,
            website: row.website,
            portfolio_url: row.portfolio_url,
            message: `FOUNDING HOUSE · Country: ${a.country} · Instagram: ${a.instagram} · Categories: ${a.categories.join(", ")} · Price range: ${a.price_range}`,
        }]);
        if (fallbackError) throw fallbackError;
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
        const cleanEmail = email.toLowerCase().trim();

        const { error } = await supabase
            .from('subscribers')
            .insert([{ email: cleanEmail }]);

        if (error) {
            if (error.code === '23505') return true; // Already exists, return true to show success anyway
            throw error;
        }

        // Send the welcome email (async invokation)
        try {
            await supabase.functions.invoke('send-email', {
                body: {
                    to: cleanEmail,
                    subject: "Welcome to the MENA ROYAL Journal",
                    html: `
                        <div style="font-family: serif; max-width: 600px; padding: 40px; border: 1px solid #eee;">
                            <h1 style="font-weight: 300;">The <span style="font-style: italic;">Journal</span></h1>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                            <p>Confirming your institutional subscription to the MENA ROYAL collective archive.</p>
                        </div>
                    `
                }
            });
        } catch (e) {
            console.warn("Newsletter welcome email delayed:", e);
        }

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
                status: 'pending',
                designer_email: designerEmail
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
