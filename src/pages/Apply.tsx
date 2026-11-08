import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { brandService, type FoundingHouseApplication } from "@/services/brandService";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const COUNTRIES = [
    "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Oman",
    "Lebanon", "Jordan", "Egypt", "Palestine", "Iraq", "Morocco", "Tunisia", "Other",
];
const CATEGORIES = ["Couture", "Ready-to-wear", "Abayas & kaftans", "Bridal", "Jewelry", "Bags & accessories", "Fragrance & beauty", "Home & objects"];
const PRICE_RANGES = ["Under $500", "$500 – $1,500", "$1,500 – $5,000", "$5,000 – $15,000", "Above $15,000"];

const empty: FoundingHouseApplication = {
    contact_name: "", company_name: "", country: "", instagram: "", website: "", categories: [], price_range: "", email: "",
};

const field = "w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-lg sm:text-xl font-light";
const labelCls = "font-sans text-[10px] editorial-spacing text-muted-foreground uppercase";

const Apply = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState<FoundingHouseApplication>(empty);

    const set = (key: keyof FoundingHouseApplication, value: any) => setForm(prev => ({ ...prev, [key]: value }));
    const toggleCategory = (c: string) =>
        set("categories", form.categories.includes(c) ? form.categories.filter(x => x !== c) : [...form.categories, c]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.categories.length === 0) { toast.error("Choose at least one category."); return; }
        setIsSubmitting(true);
        try {
            await brandService.applyAsFoundingHouse(form);
            emailService.sendAdminNotification({
                company_name: form.company_name,
                contact_name: form.contact_name,
                email: form.email,
                website: form.website,
                portfolio_url: form.instagram,
                message: `Founding house · ${form.country} · ${form.categories.join(", ")} · ${form.price_range}`,
            }).catch(() => undefined);
            setSent(true);
            setForm(empty);
        } catch (error: any) {
            console.error("Application error:", error?.message || error);
            toast.error("We could not send your application. Please try again or write to us.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="bg-background min-h-screen">
                <div className="pt-40 pb-20 border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.4em]">
                            Founding Houses
                        </p>
                        <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl font-light text-foreground tracking-tighter leading-none mb-10">
                            Apply as a <span className="italic">founding house</span>
                        </h1>
                        <p className="font-sans text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed editorial-spacing font-light">
                            MENA ROYAL is the home of the Middle East's finest design houses. We are opening with a first circle of houses from Saudi Arabia, the UAE, Kuwait and the region.
                        </p>
                        <p className="inline-block mt-10 border border-black px-6 py-3 font-sans text-[11px] editorial-spacing uppercase">
                            0% commission for your first 3 months
                        </p>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                        <div className="lg:col-span-4 space-y-12">
                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl italic font-light">What founding houses get</h3>
                                <ul className="font-sans text-xs text-muted-foreground leading-relaxed editorial-spacing font-light space-y-3">
                                    <li>0% commission for 3 months from your start date, then 20%.</li>
                                    <li>Paid at the same moment as the buyer pays, in one transaction.</li>
                                    <li>A certificate of authenticity for every piece, signed by your house.</li>
                                    <li>Your own house page, in front of buyers in the Gulf and worldwide.</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl italic font-light">How it works</h3>
                                <p className="font-sans text-xs text-muted-foreground leading-relaxed editorial-spacing font-light">
                                    Send this form. We review every house and reply by email within a week.
                                </p>
                            </div>
                            <div className="pt-10 border-t border-border">
                                <p className="font-sans text-[9px] editorial-spacing text-muted-foreground mb-4">QUESTIONS</p>
                                <p className="font-serif text-xl font-light break-all">archive@menaroyal.com</p>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            {sent ? (
                                <div className="border border-black p-10 space-y-4">
                                    <Check className="w-6 h-6" />
                                    <h2 className="font-serif text-3xl font-light">Thank you. Your application is in.</h2>
                                    <p className="font-sans text-sm text-muted-foreground">We will reply by email within a week.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <label className="space-y-3 block">
                                            <span className={labelCls}>Your name</span>
                                            <input required name="contact_name" autoComplete="name" value={form.contact_name} onChange={e => set("contact_name", e.target.value)} className={field} />
                                        </label>
                                        <label className="space-y-3 block">
                                            <span className={labelCls}>House name</span>
                                            <input required name="company_name" value={form.company_name} onChange={e => set("company_name", e.target.value)} className={field} />
                                        </label>
                                        <label className="space-y-3 block">
                                            <span className={labelCls}>Country</span>
                                            <select required name="country" value={form.country} onChange={e => set("country", e.target.value)} className={`${field} appearance-none`}>
                                                <option value="" disabled>Choose…</option>
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </label>
                                        <label className="space-y-3 block">
                                            <span className={labelCls}>Email</span>
                                            <input required type="email" name="email" autoComplete="email" value={form.email} onChange={e => set("email", e.target.value)} className={field} />
                                        </label>
                                        <label className="space-y-3 block">
                                            <span className={labelCls}>Instagram</span>
                                            <input required name="instagram" value={form.instagram} onChange={e => set("instagram", e.target.value)} className={field} placeholder="@yourhouse" />
                                        </label>
                                        <label className="space-y-3 block">
                                            <span className={labelCls}>Website</span>
                                            <input type="url" name="website" value={form.website} onChange={e => set("website", e.target.value)} className={field} placeholder="https://" />
                                        </label>
                                    </div>

                                    <fieldset className="space-y-4">
                                        <legend className={labelCls}>Categories</legend>
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {CATEGORIES.map(c => (
                                                <button
                                                    type="button"
                                                    key={c}
                                                    onClick={() => toggleCategory(c)}
                                                    aria-pressed={form.categories.includes(c)}
                                                    className={`px-4 py-2 border font-sans text-[11px] transition-colors ${form.categories.includes(c) ? "bg-black text-white border-black" : "border-border hover:border-black"}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <fieldset className="space-y-4">
                                        <legend className={labelCls}>Typical price range</legend>
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {PRICE_RANGES.map(p => (
                                                <label key={p} className={`px-4 py-2 border font-sans text-[11px] cursor-pointer ${form.price_range === p ? "bg-black text-white border-black" : "border-border hover:border-black"}`}>
                                                    <input type="radio" name="price_range" value={p} required checked={form.price_range === p} onChange={() => set("price_range", p)} className="sr-only" />
                                                    {p}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="group w-full lg:w-auto font-sans text-[11px] editorial-spacing px-16 py-6 flex items-center justify-center gap-4 bg-black text-white disabled:opacity-50"
                                    >
                                        <span className="uppercase tracking-[0.3em]">{isSubmitting ? "Sending" : "Apply as a founding house"}</span>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Apply;
