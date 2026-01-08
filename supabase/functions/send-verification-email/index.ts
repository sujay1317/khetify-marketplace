import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  confirmationUrl: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, userName }: VerificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "KhetiFy <noreply@khetify.shop>",
      to: [email],
      subject: "Verify your KhetiFy account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #16a34a; font-size: 28px; margin: 0;">🌾 KhetiFy</h1>
                <p style="color: #666; margin-top: 8px;">From Sellers to Farmers, Delivered with Care</p>
              </div>
              
              <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">
                Welcome${userName ? `, ${userName}` : ''}! 👋
              </h2>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 24px;">
                Thank you for joining KhetiFy! Please verify your email address to complete your registration and start exploring quality seeds, fertilizers & farm tools.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #16a34a; word-break: break-all;">${confirmationUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you didn't create an account with KhetiFy, you can safely ignore this email.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
              © 2024 KhetiFy - Connecting sellers with farmers across India
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
