-- ======================================================
-- 🏛️ MENA ROYAL: FIRST INSTITUTIONAL STORY SEED
-- ======================================================

INSERT INTO public.stories 
(title, subtitle, slug, content, image, category, read_time, published) 
VALUES (
'The New Lexicon of Luxury: Archiving Middle Eastern Excellence',
'True luxury is no longer defined by logo fatigue, but by the quiet perfection of heritage craft. MENA ROYAL is the definitive conduit for this evolution.',
'new-lexicon-of-luxury',
'For decades, the global definition of luxury was dictated primarily by European heritage houses. Today, the pendulum swings eastward. The discerning collector no longer seeks the ubiquitous; they seek the profound. They seek the master artisans of the Levant, the architectural silhouettes born in the Gulf, and the centuries-old embroidery techniques preserved in North Africa.

We are witnessing a paradigm shift where provenance supersedes brand. Middle Eastern craftsmanship—historically relegated to mere "inspiration" for Western mood boards—is now reclaiming its rightful position as the apex of high-fidelity design.

> "True luxury is an act of preservation. MENA ROYAL does not merely sell garments; we curate the living heritage of a region."

The artisanal communities of the MENA region operate on a different temporal axis. A single hand-beaded caftan or sculpted abaya requires hundreds of hours of meticulous focus. This is not fast fashion; this is slow, deliberate excellence. It is the antithesis of mass production. 

When you acquire a piece through the Institutional Archive, you are not simply making a purchase. You are making an investment in the continuation of a mastercraft. You are securing a narrative.

We built this platform with architectural restraint to let the work breathe. By eliminating the visual noise of traditional e-commerce, we force a singular focus on the craftsmanship. This is the new vanguard of luxury: honest, transparent, and unequivocally Middle Eastern.',
'https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?q=80&w=2000&auto=format&fit=crop',
'Culture',
'4 Min Read',
true
) ON CONFLICT (slug) DO UPDATE 
SET content = EXCLUDED.content, 
    published = true;
