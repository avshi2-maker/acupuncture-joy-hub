import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { MapPin, Navigation, Car, Loader2, Calendar, Clock, ParkingCircle, MessageCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import appointmentBg from '@/assets/whatsapp-landing-bg.png';

interface AppointmentDetails {
  title: string;
  start_time: string;
  patients?: { full_name: string };
  clinics?: {
    name: string;
    address: string | null;
    phone: string | null;
    booking_contact_phone: string | null;
    general_instructions: string | null;
    landing_page_bg_url: string | null;
    parking_instructions: string | null;
    map_embed_url: string | null;
  };
}

// Translations
const translations = {
  en: {
    loading: 'Loading...',
    error: 'Error',
    appointmentReminder: 'Appointment Reminder',
    hello: 'Hello',
    reminderText: 'This is a reminder for your TCM treatment.',
    confirmBelow: 'Please confirm your arrival below.',
    willAttend: 'Will you be attending?',
    noReschedule: 'No / Reschedule',
    confirmArrival: 'Confirm Arrival',
    whatsappNote: 'Clicking will open WhatsApp with a pre-written message',
    confirmYes: 'Hi, I confirm my arrival for the upcoming treatment. See you there! ✅',
    confirmNo: 'Hi, unfortunately I cannot make it to the treatment. Please contact me to reschedule. ❌',
  },
  he: {
    loading: 'טוען...',
    error: 'שגיאה',
    appointmentReminder: 'תזכורת לתור',
    hello: 'שלום',
    reminderText: 'זוהי תזכורת לטיפול הרפואה הסינית שלך.',
    confirmBelow: 'אנא אשר/י את הגעתך למטה.',
    willAttend: 'האם תגיע/י לתור?',
    noReschedule: 'לא / לתאם מחדש',
    confirmArrival: 'אישור הגעה',
    whatsappNote: 'לחיצה תפתח וואטסאפ עם הודעה מוכנה',
    confirmYes: 'היי, אני מאשר/ת את הגעתי לטיפול. נתראה! ✅',
    confirmNo: 'היי, לצערי לא אוכל להגיע לטיפול. אנא צרו איתי קשר לתיאום מחדש. ❌',
  }
};

export default function AppointmentLanding() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const langParam = searchParams.get('lang');
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'he'>(langParam === 'he' ? 'he' : 'en');

  const t = translations[lang];
  const isRTL = lang === 'he';

  // Configuration - can be overridden by clinic data
  const [config, setConfig] = useState({
    therapistPhone: '972500000000',
    clinicAddress: 'Tel Aviv, Israel',
    clinicName: 'TCM Clinic',
    mapEmbedURL: '',
    parkingInfo: lang === 'he' ? 'חניה זמינה בקרבת מקום' : 'Nearby parking available',
    backgroundImage: '',
  });

  useEffect(() => {
    if (token) {
      fetchAppointmentDetails();
    } else {
      setLoading(false);
      setError(t.error);
    }
  }, [token]);

  const fetchAppointmentDetails = async () => {
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointment-confirm?token=${token}&action=details`;
      
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.appointment) {
        setAppointment(data.appointment);
        
        // Update config from clinic data if available
        if (data.appointment.clinics) {
          const clinic = data.appointment.clinics;
          setConfig(prev => ({
            ...prev,
            clinicName: clinic.name || prev.clinicName,
            clinicAddress: clinic.address || prev.clinicAddress,
            therapistPhone: clinic.booking_contact_phone?.replace(/\D/g, '') || clinic.phone?.replace(/\D/g, '') || prev.therapistPhone,
            parkingInfo: clinic.parking_instructions || clinic.general_instructions || prev.parkingInfo,
            mapEmbedURL: clinic.map_embed_url || prev.mapEmbedURL,
            backgroundImage: clinic.landing_page_bg_url || '',
          }));
        }
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'he' : 'en');
  };

  const openWaze = () => {
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(config.clinicAddress)}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  const openGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.clinicAddress)}`;
    window.open(mapsUrl, '_blank');
  };

  const sendWhatsAppReply = (isConfirming: boolean) => {
    const message = isConfirming ? t.confirmYes : t.confirmNo;
    const waLink = `https://wa.me/${config.therapistPhone}?text=${encodeURIComponent(message)}`;
    window.location.href = waLink;
  };

  const bgImage = config.backgroundImage || appointmentBg;

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-jade mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold mb-2">{t.error}</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const mapEmbedUrl = config.mapEmbedURL || 
    `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(config.clinicAddress)}`;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden max-w-md w-full border border-white/80">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
          title={lang === 'en' ? 'עברית' : 'English'}
        >
          <Globe className="h-5 w-5 text-jade" />
        </button>

        {/* Header */}
        <div className="bg-jade text-white p-6 text-center relative">
          <span className="text-2xl mb-2 block">🌿</span>
          <h1 className="text-xl font-semibold">{t.appointmentReminder}</h1>
          <p className="text-jade-foreground/80 text-sm mt-1">{config.clinicName}</p>
        </div>

        {/* Greeting & Details */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {t.hello}{appointment?.patients?.full_name ? `, ${appointment.patients.full_name.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-muted-foreground mb-4">
            {t.reminderText}<br />
            <strong>{t.confirmBelow}</strong>
          </p>

          {/* Appointment Time */}
          {appointment && (
            <div className="bg-jade/10 rounded-xl p-4 mb-4 inline-flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-jade font-medium">
                <Calendar className="h-5 w-5" />
                {isRTL 
                  ? format(new Date(appointment.start_time), 'EEEE, d בMMMM yyyy', { locale: he })
                  : format(new Date(appointment.start_time), 'EEEE, MMMM d, yyyy')
                }
              </div>
              <div className="flex items-center gap-2 text-jade text-lg font-bold">
                <Clock className="h-5 w-5" />
                {format(new Date(appointment.start_time), 'HH:mm')}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="w-full h-56 bg-muted">
          <iframe
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="p-6">
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={openWaze}
              className="bg-[#33ccff] hover:bg-[#2bb8e8] text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"
            >
              <Car className="h-5 w-5" />
              Waze
            </Button>
            <Button
              onClick={openGoogleMaps}
              className="bg-[#ea4335] hover:bg-[#d63a2e] text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"
            >
              <Navigation className="h-5 w-5" />
              Google Maps
            </Button>
          </div>

          {/* Parking Info */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6">
            <ParkingCircle className="h-4 w-4" />
            <em>{config.parkingInfo}</em>
          </div>

          {/* Confirmation Section */}
          <div className="border-t pt-6">
            <h3 className="text-center font-semibold text-lg mb-4">{t.willAttend}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => sendWhatsAppReply(false)}
                variant="outline"
                className="h-14 text-base border-muted-foreground/30 hover:bg-muted flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                {t.noReschedule}
              </Button>
              <Button
                onClick={() => sendWhatsAppReply(true)}
                className="h-14 text-base bg-jade hover:bg-jade/90 flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                {t.confirmArrival}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              {t.whatsappNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
