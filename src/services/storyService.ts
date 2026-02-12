import { supabase } from "@/lib/supabase";

export interface Story {
    id: string;
    title: string;
    subtitle: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    read_time: string;
    published: boolean;
    created_at: string;
}

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
        return data as Story[];
    },

    /**
     * Fetch a single journal entry by ID.
     */
    async getStoryById(id: string) {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Story;
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
