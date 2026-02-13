import Layout from "@/components/layout/Layout";
import { useLocation } from "react-router-dom";

const Legal = () => {
    const { pathname } = useLocation();
    const title = pathname.includes("privacy") ? "Privacy Protocol" : "Terms of Service";

    return (
        <Layout>
            <div className="bg-background min-h-screen pt-40 pb-32">
                <div className="max-w-3xl mx-auto px-6">
                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.3em]">
                        Institutional Registry
                    </p>
                    <h1 className="font-serif text-4xl lg:text-6xl font-light text-foreground mb-16 italic">
                        {title}
                    </h1>

                    <div className="prose prose-sm prose-slate max-w-none font-sans text-xs leading-relaxed text-muted-foreground space-y-8 uppercase tracking-wider opacity-80">
                        <section className="space-y-4">
                            <h2 className="text-foreground font-bold border-b border-border pb-2">1. Archival Purpose</h2>
                            <p>MENA ROYAL acts as an institutional archive and marketplace for prestige design houses. By accessing this sanctuary, you agree to our curation protocols and intellectual property protections for our artisans.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-foreground font-bold border-b border-border pb-2">2. Acquisition & Logistics</h2>
                            <p>All acquisitions made through the portal are subject to international heritage shipping standards. As each piece involves artisanal craftsmanship, fulfillment times may vary based on house capacity.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-foreground font-bold border-b border-border pb-2">3. Data Preservation (Privacy)</h2>
                            <p>We archive only the data necessary for transaction fulfillments and journal subscriptions. Your identity is secured within our institutional encrypted vaults and is never accessible to third-party commercial entities.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-foreground font-bold border-b border-border pb-2">4. Dispute Resolution</h2>
                            <p>In the event of a curation discrepancy, acquisitions are governed by the merchant laws of the registered brand's jurisdiction, overseen by the MENA ROYAL Collective archive.</p>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Legal;
