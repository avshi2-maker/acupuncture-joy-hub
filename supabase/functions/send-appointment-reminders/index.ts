import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Clinic {
  id: string;
  name: string;
  reminder_enabled: boolean;
  reminder_timing: string[];
  reminder_channel: string;
  booking_contact_phone: string | null;
}

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  clinic_id: string;
  patient_id: string | null;
  patients: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
  clinics: Clinic | null;
}

// Convert timing string to milliseconds
function timingToMs(timing: string): number {
  const match = timing.match(/^(\d+)(h|m)$/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  return unit === 'h' ? value * 60 * 60 * 1000 : value * 60 * 1000;
}

// Format phone for WhatsApp
function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^0-9]/g, '').replace(/^0/, '972');
}

// Generate WhatsApp message URL
function generateWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Starting appointment reminder check...");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const remindersToSend: Array<{
      appointment: Appointment;
      timing: string;
      channel: string;
    }> = [];

    // Get all clinics with reminders enabled
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select("*")
      .eq("reminder_enabled", true);

    if (clinicsError) {
      console.error("Error fetching clinics:", clinicsError);
      throw clinicsError;
    }

    console.log(`Found ${clinics?.length || 0} clinics with reminders enabled`);

    // For each clinic, check appointments that match reminder timing
    for (const clinic of clinics || []) {
      const timings = clinic.reminder_timing || ["24h"];
      
      for (const timing of timings) {
        const msAhead = timingToMs(timing);
        if (msAhead === 0) continue;

        // Calculate the time window for this reminder
        // We check for appointments starting within a 5-minute window of the reminder time
        const targetTime = new Date(now.getTime() + msAhead);
        const windowStart = new Date(targetTime.getTime() - 2.5 * 60 * 1000);
        const windowEnd = new Date(targetTime.getTime() + 2.5 * 60 * 1000);

        console.log(`Checking ${timing} reminders for clinic ${clinic.name}`);
        console.log(`Window: ${windowStart.toISOString()} to ${windowEnd.toISOString()}`);

        // Fetch appointments in this window
        const { data: appointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            id,
            title,
            start_time,
            end_time,
            notes,
            clinic_id,
            patient_id,
            patients (
              full_name,
              phone,
              email
            ),
            clinics (
              id,
              name,
              reminder_enabled,
              reminder_timing,
              reminder_channel,
              booking_contact_phone
            )
          `)
          .eq("clinic_id", clinic.id)
          .eq("status", "scheduled")
          .gte("start_time", windowStart.toISOString())
          .lte("start_time", windowEnd.toISOString());

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          continue;
        }

        for (const appt of appointments || []) {
          // Handle the joined data - patients and clinics come as arrays from the join
          const patientData = Array.isArray(appt.patients) ? appt.patients[0] : appt.patients;
          const clinicData = Array.isArray(appt.clinics) ? appt.clinics[0] : appt.clinics;
          
          if (patientData) {
            const appointment: Appointment = {
              id: appt.id,
              title: appt.title,
              start_time: appt.start_time,
              end_time: appt.end_time,
              notes: appt.notes,
              clinic_id: appt.clinic_id,
              patient_id: appt.patient_id,
              patients: patientData,
              clinics: clinicData,
            };
            remindersToSend.push({
              appointment,
              timing,
              channel: clinic.reminder_channel || "whatsapp",
            });
          }
        }
      }
    }

    console.log(`Found ${remindersToSend.length} reminders to send`);

    const results = {
      sent: 0,
      failed: 0,
      details: [] as Array<{ patient: string; channel: string; status: string; message?: string }>,
    };

    // Send reminders
    for (const { appointment, timing, channel } of remindersToSend) {
      const patient = appointment.patients!;
      const clinic = appointment.clinics!;
      const appointmentDate = new Date(appointment.start_time);
      
      const dateStr = appointmentDate.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = appointmentDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const reminderMessage = `שלום ${patient.full_name},\n\nתזכורת לתור שלך ב${clinic.name}:\n📅 ${dateStr}\n⏰ ${timeStr}\n\nנשמח לראותך!`;

      try {
        // Send based on channel preference
        if ((channel === "whatsapp" || channel === "both") && patient.phone) {
          // For WhatsApp, we generate the URL and send it via email notification
          // In production, you would integrate with WhatsApp Business API
          const whatsappUrl = generateWhatsAppUrl(patient.phone, reminderMessage);
          console.log(`WhatsApp reminder URL for ${patient.full_name}: ${whatsappUrl}`);
          
          // Send email with WhatsApp link as fallback
          if (patient.email) {
            await resend.emails.send({
              from: "Clinic Reminders <onboarding@resend.dev>",
              to: [patient.email],
              subject: `תזכורת לתור - ${clinic.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                  <h2>תזכורת לתור</h2>
                  <p>${reminderMessage.replace(/\n/g, '<br>')}</p>
                  <p><a href="${whatsappUrl}" style="display: inline-block; padding: 10px 20px; background: #25D366; color: white; text-decoration: none; border-radius: 5px;">שלח הודעה בווטסאפ</a></p>
                </div>
              `,
            });
            results.details.push({
              patient: patient.full_name,
              channel: "whatsapp+email",
              status: "sent",
            });
            results.sent++;
          } else {
            results.details.push({
              patient: patient.full_name,
              channel: "whatsapp",
              status: "logged",
              message: "No email for fallback, URL logged",
            });
          }
        }

        if ((channel === "sms" || channel === "both") && patient.phone) {
          // SMS requires Twilio or similar integration
          // For now, log and send email notification
          console.log(`SMS reminder for ${patient.full_name} to ${patient.phone}: ${reminderMessage}`);
          
          if (patient.email) {
            await resend.emails.send({
              from: "Clinic Reminders <onboarding@resend.dev>",
              to: [patient.email],
              subject: `תזכורת לתור - ${clinic.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                  <h2>תזכורת לתור</h2>
                  <p>${reminderMessage.replace(/\n/g, '<br>')}</p>
                </div>
              `,
            });
            results.details.push({
              patient: patient.full_name,
              channel: "sms+email",
              status: "sent",
              message: "SMS logged, email sent as fallback",
            });
            results.sent++;
          } else {
            results.details.push({
              patient: patient.full_name,
              channel: "sms",
              status: "logged",
              message: "No email for fallback",
            });
          }
        }

        // Always send email if available and no other channel worked
        if (channel !== "whatsapp" && channel !== "sms" && channel !== "both" && patient.email) {
          await resend.emails.send({
            from: "Clinic Reminders <onboarding@resend.dev>",
            to: [patient.email],
            subject: `תזכורת לתור - ${clinic.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                <h2>תזכורת לתור</h2>
                <p>${reminderMessage.replace(/\n/g, '<br>')}</p>
              </div>
            `,
          });
          results.details.push({
            patient: patient.full_name,
            channel: "email",
            status: "sent",
          });
          results.sent++;
        }
      } catch (error: any) {
        console.error(`Error sending reminder to ${patient.full_name}:`, error);
        results.failed++;
        results.details.push({
          patient: patient.full_name,
          channel,
          status: "failed",
          message: error.message,
        });
      }
    }

    console.log("Reminder processing complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${remindersToSend.length} reminders`,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders:", error);
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
