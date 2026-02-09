import { supabase } from "@/lib/supabase";

export const emailService = {
  /**
   * Send a prestige onboarding email via Supabase Edge Functions.
   * This bypasses CORS and keeps the API key secure.
   */
  async sendApprovalEmail(toEmail: string, brandName: string, onboardingSlug: string) {
    console.log(`Initiating Archival Email for: ${brandName} to ${toEmail}`);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject: "Your Atelier has been Archived | MENA ROYAL",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
              <h1 style="color: #000; font-weight: 300; letter-spacing: -1px; font-size: 32px;">Welcome to the <span style="font-style: italic;">Archive</span></h1>
              <p style="font-family: sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #666;">Institutional Invitation</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                We are pleased to inform you that <strong>${brandName}</strong> has been selected for the MENA ROYAL Collective.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #666;">
                Your house now represents the pinnacle of Middle Eastern craftsmanship in our digital archive. The next step is to curate your Heritage Profile.
              </p>
              <div style="margin: 40px 0;">
                <a href="${window.location.origin}/onboarding/${onboardingSlug}" 
                   style="background: #000; color: #fff; text-decoration: none; padding: 15px 30px; font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
                   Enter the Archive
                </a>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 60px;">
                MENA ROYAL | Curating Regional Excellence
              </p>
            </div>
          `,
        },
      });

      if (error) {
        console.error("Edge Function invoked, but returned error:", error);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error("Linkage to Edge Function failed physically:", error.message);
      return false;
    }
  },

  /**
   * Send a graceful rejection email via Edge Functions.
   */
  async sendRejectionEmail(toEmail: string, brandName: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject: "Archive Application Status | MENA ROYAL",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
              <h2 style="color: #000; font-weight: 300;">Status: <span style="font-style: italic;">Review Complete</span></h2>
              <p style="font-size: 14px; line-height: 1.6; color: #333;">
                Thank you for your application to represent <strong>${brandName}</strong> in our collective. 
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #666;">
                At this time, our curators have decided to move forward with a different selection for this seasonal archive.
              </p>
            </div>
          `,
        },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }
};
