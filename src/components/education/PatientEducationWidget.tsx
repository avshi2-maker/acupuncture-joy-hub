import { useState } from 'react';
import { ChevronDown, Printer, MessageCircle, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatientEducationWidgetProps {
  patientPhone?: string;
  patientName?: string;
  className?: string;
}

const ARTICLE_CONTENT = {
  title: 'ריבית דריבית של בריאות',
  subtitle: 'מדוע טיפולי "SOS" עולים לך יותר',
  sections: [
    {
      heading: 'הרעיון',
      content: 'מטופלים רבים רואים באקופונקטורה כמו משכך כאבים: "יש לי כאב, הולך פעם אחת, הכאב נעלם, אני מפסיק." בעוד שזה מספק הקלה (אפקט ה"פלסטר"), נתונים קליניים מראים שריפוי אמיתי עוקב אחר ציר זמן ביולוגי, לא סימפטומטי.',
    },
    {
      heading: 'חלון 72 השעות',
      content: 'מחקרים מראים שההשפעה האנטי-דלקתית של טיפול בודד מגיעה לשיא ב-24 שעות ומתחילה לדעוך אחרי 72. אם נחכה חודש בין טיפולים, נתחיל מאפס בכל פעם.',
    },
    {
      heading: 'נוירופלסטיות (שינוי תכנות)',
      content: 'כאב כרוני הוא "הרגל נלמד" של מערכת העצבים. כדי "לשכוח" את לולאת הכאב הזו, הגוף דורש קלט עקבי במשך 4-6 שבועות.',
    },
    {
      heading: 'העקומה המצטברת',
      content: 'טיפול ארוך טווח מערם יתרונות. טיפול 2 בונה על טיפול 1. עד טיפול 5, אנחנו כבר לא מכבים שריפות; אנחנו בונים מחדש את היסודות.',
    },
  ],
  quote: 'בדיוק כמו שספורטאי לא יכול להתאמן לאיירונמן בסוף שבוע אחד, הגוף שלך לא יכול להפוך שנים של מתח בשעה אחת.',
  verdict: 'תחזוקה היא לא תלות; היא יעילות. השקיעו ביסודות, לא רק בסימפטומים.',
};

// English version for WhatsApp sharing
const WHATSAPP_MESSAGE = `🌱 *The Logic of Long-Term Care*

Many patients view Acupuncture like a painkiller: "I have pain, I go once, the pain stops, I stop."

*The Science:*
✓ The 72-Hour Window: Anti-inflammatory effects peak at 24 hours and fade after 72.
✓ Neuroplasticity: Chronic pain is a 'learned habit'. To unlearn it requires 4-6 weeks of consistent input.
✓ Cumulative Effect: Session 2 builds on Session 1. By Session 5, we're rebuilding foundations.

💡 "Just as an athlete cannot train for an Ironman in one weekend, your body cannot reverse years of stress in one hour."

*Invest in your foundation, not just your symptoms.*`;

export function PatientEducationWidget({ patientPhone, patientName, className }: PatientEducationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>${ARTICLE_CONTENT.title}</title>
        <style>
          body {
            font-family: Georgia, 'Times New Roman', serif;
            max-width: 700px;
            margin: 40px auto;
            padding: 20px;
            color: #2d2d2d;
            line-height: 1.8;
          }
          h1 { color: #2c6e49; margin-bottom: 5px; }
          h2 { color: #d68c45; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
          h3 { color: #2c6e49; margin-top: 25px; margin-bottom: 10px; }
          .quote {
            background: rgba(44, 110, 73, 0.1);
            border-right: 4px solid #2c6e49;
            padding: 15px 20px;
            margin: 25px 0;
            font-style: italic;
          }
          .verdict {
            background: #f5f5f0;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${ARTICLE_CONTENT.title}</h1>
        <h2>${ARTICLE_CONTENT.subtitle}</h2>
        ${ARTICLE_CONTENT.sections.map(s => `<h3>${s.heading}</h3><p>${s.content}</p>`).join('')}
        <div class="quote">"${ARTICLE_CONTENT.quote}"</div>
        <div class="verdict">${ARTICLE_CONTENT.verdict}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleWhatsAppShare = () => {
    const phoneNumber = patientPhone?.replace(/\D/g, '') || '';
    const formattedPhone = phoneNumber.startsWith('0') 
      ? `972${phoneNumber.slice(1)}` 
      : phoneNumber;
    
    const personalizedMessage = patientName 
      ? `שלום ${patientName},\n\n${WHATSAPP_MESSAGE}`
      : WHATSAPP_MESSAGE;
    
    const url = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(personalizedMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(personalizedMessage)}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className={cn('bg-card rounded-xl overflow-hidden shadow-lg border border-border', className)}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-jade hover:bg-jade-dark transition-colors p-5 flex items-center justify-between text-white cursor-pointer"
      >
        <div className="flex items-center gap-3 text-right">
          <Leaf className="h-6 w-6" />
          <div>
            <h3 className="font-bold text-lg">🌱 ההיגיון של טיפול ארוך טווח</h3>
            <span className="text-sm opacity-80">לחץ לפתיחת משאב למטופל</span>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            'h-6 w-6 transition-transform duration-300',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Collapsible Article Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-out',
          isOpen ? 'max-h-[1000px]' : 'max-h-0'
        )}
      >
        <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 text-foreground" dir="rtl">
          <p className="text-xs text-jade font-semibold tracking-wider mb-1">סדרת חינוך למטופלים</p>
          <h2 className="text-2xl font-bold text-jade-dark dark:text-jade mb-4">{ARTICLE_CONTENT.title}</h2>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            {ARTICLE_CONTENT.sections[0].content}
          </p>

          <div className="bg-jade/10 border-r-4 border-jade p-4 my-5 italic">
            "{ARTICLE_CONTENT.quote}"
          </div>

          <h4 className="text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-2">המציאות המדעית</h4>
          
          {ARTICLE_CONTENT.sections.slice(1).map((section, idx) => (
            <p key={idx} className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">{idx + 1}. {section.heading}:</strong> {section.content}
            </p>
          ))}

          <div className="bg-jade/10 border-r-4 border-jade p-4 mt-5 text-center font-semibold">
            {ARTICLE_CONTENT.verdict}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            הדפס למטופל
          </Button>
          <Button
            className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20BA5C] text-white"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-4 w-4" />
            שלח ב-WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
