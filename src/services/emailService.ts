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
              <h2 style="color: #000; font-weight: 300; letter-spacing: -1px; font-size: 24px;">Status: <span style="font-style: italic;">Review Complete</span></h2>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
              <p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
                Thank you for your application to represent <strong>${brandName}</strong> in our collective. 
              </p>
              <p style="font-family: sans-serif; font-size: 13px; line-height: 1.6; color: #666;">
                At this time, our curators have decided to move forward with a different selection for this seasonal archive. We encourage you to continue your craft and re-apply in future seasons.
              </p>
              <p style="font-size: 11px; color: #999; margin-top: 40px; font-family: sans-serif; letter-spacing: 1px;">
                MENA ROYAL | Institutional Curation
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
  },

  /**
   * Notify the Admin of a new intake request.
   */
  async sendAdminNotification(formData: any) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: "menaroyalofficial@gmail.com",
          subject: `Archive Intake Request: ${formData.company_name}`,
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #000;">
              <h2 style="color: #000; font-weight: 300; letter-spacing: -1px; font-size: 28px;">New <span style="font-style: italic;">Intake</span> Request</h2>
              <hr style="border: 0; border-top: 1px solid #000; margin: 25px 0;" />
              <div style="font-family: sans-serif; font-size: 12px; color: #333; line-height: 2;">
                <p><strong>HOUSE:</strong> ${formData.company_name.toUpperCase()}</p>
                <p><strong>CONTACT:</strong> ${formData.contact_name}</p>
                <p><strong>EMAIL:</strong> ${formData.email}</p>
                ${formData.website ? `<p><strong>WEBSITE:</strong> <a href="${formData.website}">${formData.website}</a></p>` : ''}
                <p><strong>PORTFOLIO:</strong> <a href="${formData.portfolio_url}">${formData.portfolio_url}</a></p>
              </div>
              <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; font-style: italic; font-family: sans-serif; font-size: 13px;">
                "${formData.message}"
              </div>
              <div style="margin-top: 40px;">
                <a href="${window.location.origin}/admin" 
                   style="background: #000; color: #fff; text-decoration: none; padding: 12px 25px; font-family: sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase;">
                   Enter Vault to Review
                </a>
              </div>
            </div>
          `,
        },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Send a welcome message to new journal subscribers.
   */
  async sendNewsletterWelcome(email: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: "Welcome to the Journal | MENA ROYAL",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; text-align: center;">
              <h1 style="color: #000; font-weight: 300; letter-spacing: 5px; font-size: 24px; text-transform: uppercase;">MENA ROYAL</h1>
              <p style="font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #666; margin-bottom: 40px;">Collective Journal</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <h2 style="font-weight: 300; font-style: italic; font-size: 28px;">Welcome to the <span style="border-bottom: 2px solid #000;">Inner Circle</span></h2>
              <p style="font-family: sans-serif; font-size: 14px; line-height: 1.8; color: #333; margin: 30px 0;">
                You are now archived in our Journal. Expect curated updates on new exhibits, artisan narratives, and the evolution of Middle Eastern luxury.
              </p>
              <div style="margin: 40px 0;">
                <a href="${window.location.origin}/shop" 
                   style="background: #000; color: #fff; text-decoration: none; padding: 15px 40px; font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
                   Discover the Archive
                </a>
              </div>
              <p style="font-size: 11px; color: #aaa; font-family: sans-serif; margin-top: 60px;">
                You are receiving this because you subscribed to the MENA ROYAL Journal.
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
