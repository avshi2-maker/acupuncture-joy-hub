import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, MessageCircle, CheckCircle2, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const tierPrices: Record<string, string> = {
  trial: 'חינם',
  standard: '₪40 + מע״מ',
  premium: '₪50 + מע״מ',
};

const tierNames: Record<string, string> = {
  trial: 'ניסיון',
  standard: 'סטנדרט',
  premium: 'פרימיום',
};

export default function PaymentInstructions() {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') || 'trial';
  const isTrial = tier === 'trial';

  const whatsappMessage = encodeURIComponent(
    `שלום ד״ר רוני, סיימתי את ההרשמה למערכת TCM Clinic ובחרתי בתוכנית ${tierNames[tier]}. ${isTrial ? 'אשמח לקבל סיסמת גישה לניסיון.' : 'שילמתי דרך Invoice4U ואשמח לקבל סיסמת גישה.'}`
  );

  return (
    <>
      <Helmet>
        <title>הוראות תשלום | TCM Clinic</title>
        <meta name="description" content="הוראות לתשלום וקבלת גישה למערכת" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לתמחור
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center mb-6">
              <Leaf className="h-8 w-8 text-jade" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              תוכנית {tierNames[tier]}
            </h1>
            <p className="text-2xl font-bold text-jade">{tierPrices[tier]}</p>
          </div>

          <div className="space-y-6">
            {!isTrial && (
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-light rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">שלב 1: תשלום</CardTitle>
                      <CardDescription>תשלום מאובטח דרך Invoice4U</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    לחצו על הכפתור למטה לביצוע תשלום מאובטח:
                  </p>
                  <Button 
                    asChild 
                    className="w-full bg-gold hover:bg-gold/90"
                  >
                    <a 
                      href="https://www.invoice4u.co.il/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <CreditCard className="ml-2 h-4 w-4" />
                      עבור לתשלום ב-Invoice4U
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-jade" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {isTrial ? 'שלח בקשה לד״ר רוני' : 'שלב 2: שלח אישור'}
                    </CardTitle>
                    <CardDescription>
                      {isTrial 
                        ? 'שלח הודעה לקבלת סיסמת גישה לניסיון'
                        : 'שלח אישור תשלום לקבלת סיסמת גישה'
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {isTrial
                    ? 'לאחר שליחת ההודעה, ד״ר רוני ספיר תשלח לכם סיסמת גישה ייחודית תוך מספר שעות.'
                    : 'לאחר התשלום, שלחו אישור תשלום לד״ר רוני ספיר בוואטסאפ וקבלו סיסמת גישה.'
                  }
                </p>
                <Button 
                  asChild 
                  className="w-full"
                >
                  <a 
                    href={`https://wa.me/972505231042?text=${whatsappMessage}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="ml-2 h-4 w-4" />
                    שלח הודעה לד״ר רוני (050-5231042)
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-jade/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-jade" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {isTrial ? 'שלב 2: כניסה למערכת' : 'שלב 3: כניסה למערכת'}
                    </CardTitle>
                    <CardDescription>הזינו את הסיסמה שקיבלתם</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  לאחר קבלת הסיסמה מד״ר רוני, לחצו על הכפתור למטה להזנתה:
                </p>
                <Button 
                  asChild 
                  variant="outline"
                  className="w-full"
                >
                  <Link to="/gate">
                    יש לי סיסמה - כניסה למערכת
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            לשאלות נוספות, צרו קשר עם ד״ר רוני ספיר:{' '}
            <a 
              href="https://wa.me/972505231042" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-jade hover:underline"
            >
              050-5231042
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
