import { supabase } from "@/lib/supabase";
import { z } from "zod";

export const StorySchema = z.object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string().optional().nullable(),
    excerpt: z.string().optional().nullable(),
    content: z.string(),
    image: z.string(),
    category: z.string(),
    read_time: z.string(),
    published: z.boolean(),
    product_tags: z.array(z.string()).optional().nullable(),
    created_at: z.string()
});

export type Story = z.infer<typeof StorySchema>;

export const storyService = {
    /**
     * Fetch all published journal entries.
     */
    async getAllStories() {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Archival Retrieval Error:", error);
            return [];
        }
        return (data || []).map(item => StorySchema.parse(item));
    },

    /**
     * Fetch a single journal entry by Slug.
     */
    async getStoryBySlug(slug: string) {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return StorySchema.parse(data);
    },

    /**
     * ADMIN: Create a new journal entry.
     */
    async createStory(story: Partial<Story>) {
        const { data, error } = await supabase
            .from('stories')
            .insert([story])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * ADMIN: Delete a journal entry.
     */
    async deleteStory(id: string) {
        const { error } = await supabase
            .from('stories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
