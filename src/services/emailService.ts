import { supabase } from "@/lib/supabase";

export const emailService = {
  /**
   * Send a prestige onboarding email via Supabase Edge Functions.
   */
  async sendApprovalEmail(toEmail: string, brandName: string, onboardingSlug: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
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
              <div style="margin: 40px 0;">
                <a href="${window.location.origin}/onboarding/${onboardingSlug}" 
                   style="background: #000; color: #fff; text-decoration: none; padding: 15px 30px; font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
                   Enter the Archive
                </a>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 60px;">MENA ROYAL | Curating Regional Excellence</p>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * Send a graceful rejection email.
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
                Thank you for your application for <strong>${brandName}</strong>. 
              </p>
              <p style="font-family: sans-serif; font-size: 13px; line-height: 1.6; color: #666;">
                At this time, we are moving forward with a different selection. We encourage you to re-apply in future seasons.
              </p>
              <p style="font-size: 11px; color: #999; margin-top: 40px; font-family: sans-serif; letter-spacing: 1px;">MENA ROYAL | Institutional Curation</p>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
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
                <p><strong>PORTFOLIO:</strong> <a href="${formData.portfolio_url}">${formData.portfolio_url}</a></p>
              </div>
              <div style="margin-top: 40px;">
                <a href="${window.location.origin}/admin" style="background: #000; color: #fff; text-decoration: none; padding: 12px 25px; font-family: sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase;">Review in Vault</a>
              </div>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * CUSTOMER: Send order confirmation.
   */
  async sendOrderConfirmation(toEmail: string, orderDetails: any) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject: `Acquisition Confirmed: #${orderDetails.id.slice(0, 8)} | MENA ROYAL`,
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
              <h1 style="color: #000; font-weight: 300; letter-spacing: -1px; font-size: 32px;">Acquisition <span style="font-style: italic;">Confirmed</span></h1>
              <p style="font-family: sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #666;">Official Receipt</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Thank you for your acquisition. Your chosen heritage pieces have been secured.</p>
              <div style="margin: 40px 0; background: #f9f9f9; padding: 30px;">
                <h3 style="font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Summary</h3>
                <div style="display: flex; justify-content: space-between; font-family: sans-serif; font-size: 14px; font-weight: bold; margin-top: 20px;">
                  <span>TOTAL VALUATION</span>
                  <span>$${orderDetails.total_amount}</span>
                </div>
              </div>
              <a href="${window.location.origin}/account" style="background: #000; color: #fff; text-decoration: none; padding: 15px 30px; font-family: sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Track My Archive</a>
              <p style="font-size: 11px; color: #999; margin-top: 60px;">MENA ROYAL | Global Logistics</p>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * DESIGNER: Send sales notification.
   */
  async sendSaleNotification(toEmail: string, brandName: string, amount: number) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject: "Heritage Patronage Received | MENA ROYAL",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #000;">
              <h2 style="color: #000; font-weight: 300; letter-spacing: -1px; font-size: 28px;">New <span style="font-style: italic;">Patronage</span></h2>
              <hr style="border: 0; border-top: 1px solid #000; margin: 25px 0;" />
              <p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333;">A selection from <strong>${brandName}</strong> has been acquired.</p>
              <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; text-align: center;">
                <p style="font-family: sans-serif; font-size: 10px; color: #666; text-transform: uppercase;">Credit to Balance</p>
                <p style="font-size: 32px; font-weight: bold;">$${amount}</p>
              </div>
              <a href="${window.location.origin}/designer" style="background: #000; color: #fff; text-decoration: none; padding: 12px 25px; font-family: sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase;">Manage Fulfillment</a>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * CUSTOMER: Send shipping update.
   */
  async sendShippingUpdate(toEmail: string, orderId: string, trackingNumber?: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject: "Archive Transformation: Shipped | MENA ROYAL",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
              <h2 style="color: #000; font-weight: 300; letter-spacing: -1px; font-size: 24px;">Status: <span style="font-style: italic;">En Route</span></h2>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Your acquired heritage pieces have departed the atelier.</p>
              ${trackingNumber ? `
                <div style="margin: 30px 0; border-left: 2px solid #000; padding-left: 20px;">
                  <p style="font-size: 10px; color: #999; text-transform: uppercase;">Tracking Reference</p>
                  <p style="font-size: 16px; font-family: monospace;">${trackingNumber}</p>
                </div>
              ` : ''}
              <p style="font-size: 11px; color: #999; margin-top: 40px;">MENA ROYAL | Global Logistics Concierge</p>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * ADMIN: Order Alert.
   */
  async sendAdminOrderAlert(orderDetails: any) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: "menaroyalofficial@gmail.com",
          subject: `New Digital Deposit: Order #${orderDetails.id.slice(0, 8)}`,
          html: `<div style="padding: 40px; border: 1px solid #000; font-family: serif;">
            <h2>New Deposit</h2>
            <p>ID: ${orderDetails.id}</p>
            <p>Total: $${orderDetails.total_amount}</p>
            <p>Customer: ${orderDetails.customer_email}</p>
          </div>`
        }
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * Send a prestige invitation to new Journal subscribers.
   */
  async sendNewsletterWelcome(toEmail: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
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
                MENA ROYAL | Institutional Curation
              </p>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  },

  /**
   * Send a confirmation email for institutional waitlist requests.
   */
  async sendWaitlistConfirmation(toEmail: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject: "Archival Access Request Received | MENA ROYAL",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 60px; border: 1px solid #000; text-align: center;">
              <h1 style="color: #000; font-weight: 300; letter-spacing: 8px; font-size: 28px; text-transform: uppercase; margin-bottom: 40px;">MENA ROYAL</h1>
              <p style="font-family: sans-serif; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #999; margin-bottom: 60px;">Institutional Archive</p>
              
              <div style="margin: 40px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 40px 0;">
                <h2 style="font-weight: 300; font-style: italic; font-size: 32px; letter-spacing: -1px; line-height: 1.2;">
                   Correspondence <br /><span style="color: #666;">Logged</span>
                </h2>
                <p style="font-family: sans-serif; font-size: 13px; line-height: 2; color: #333; margin: 30px 0; max-width: 400px; margin-left: auto; margin-right: auto; text-transform: uppercase; letter-spacing: 1px;">
                  Your request for archival access has been successfully received by the MENA ROYAL collective.
                </p>
              </div>

              <p style="font-family: sans-serif; font-size: 11px; line-height: 1.8; color: #666; margin: 40px 0;">
                Our curators are currently reviewing the heritage queue. You will receive an invitation once the next tier of archival slots opens for your territory.
              </p>
              
              <p style="font-size: 10px; color: #000; font-family: sans-serif; margin-top: 80px; letter-spacing: 2px; text-transform: uppercase;">
                MENA ROYAL | Private Archive Access
              </p>
            </div>
          `,
        },
      });
      return !error;
    } catch (error) { return false; }
  }
};
