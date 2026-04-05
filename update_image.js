import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkdagjghexpqlnkArvxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZGFnamdoZXhwcWxua2Fydnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzAxMzksImV4cCI6MjA4NjIwNjEzOX0.XfqE8E49Y1-NK7NuisN0rBMTSa_YhTKGkftzP9ldAjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProduct() {
    const { data: products } = await supabase.from('products').select('*');
    const target = products?.find(p => p.name.toLowerCase().includes('ourain'));

    if (target) {
        console.log('Found product:', target.name);
        const { error } = await supabase.from('products').update({
            images: ['/assets/products/BenOurain_Infinite_Line.jpg']
        }).eq('id', target.id);

        if (error) console.error('Error updating:', error);
        else console.log('Successfully updated image for:', target.name);
    } else {
        console.log('Product not found in DB. Need to check name.');
    }
}
updateProduct();
