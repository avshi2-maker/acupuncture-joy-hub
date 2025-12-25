import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const registerSchema = z.object({
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(100),
  email: z.string().email('כתובת אימייל לא תקינה').max(255),
  phone: z.string().min(9, 'מספר טלפון לא תקין').max(15),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function TherapistRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('therapist_registrations')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          requested_tier: 'trial',
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('כתובת האימייל כבר רשומה במערכת');
        } else {
          throw error;
        }
        return;
      }

      toast.success('ההרשמה התקבלה בהצלחה!');
      navigate('/pricing');
    } catch (error) {
      toast.error('שגיאה בהרשמה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>הרשמה למטפלים | TCM Clinic</title>
        <meta name="description" content="הצטרפו למערכת הניהול המתקדמת למטפלים ברפואה סינית" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לדף הבית
          </Link>

          <Card className="shadow-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-jade" />
              </div>
              <CardTitle className="font-display text-3xl">הרשמה למטפלים</CardTitle>
              <CardDescription>
                הצטרפו למערכת הניהול המתקדמת למטפלים ברפואה סינית
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>שם מלא</FormLabel>
                        <FormControl>
                          <Input placeholder="ד״ר ישראל ישראלי" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>אימייל</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>טלפון</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="050-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'שולח...' : 'המשך לבחירת תוכנית'}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                כבר רשום?{' '}
                <Link to="/gate" className="text-jade hover:underline">
                  כניסה למערכת
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
