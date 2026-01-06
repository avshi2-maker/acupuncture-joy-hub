import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ProtocolPDFExportProps {
  patientName?: string;
  moduleName: string;
  diagnosis: string;
  acupuncturePoints: string[];
  herbalFormula?: string;
  herbalIngredients?: string[];
  nutritionAdvice?: string[];
  lifestyleAdvice?: string[];
  bodyCanvasRef?: React.RefObject<HTMLCanvasElement>;
  language: 'en' | 'he';
}

export function ProtocolPDFExport({
  patientName,
  moduleName,
  diagnosis,
  acupuncturePoints,
  herbalFormula,
  herbalIngredients = [],
  nutritionAdvice = [],
  lifestyleAdvice = [],
  bodyCanvasRef,
  language,
}: ProtocolPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Header with branding
      pdf.setFillColor(34, 139, 34); // Forest green
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TCM Clinical Protocol', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Module: ${moduleName}`, pageWidth / 2, 25, { align: 'center' });
      
      const date = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
      pdf.text(`Date: ${date}`, pageWidth / 2, 32, { align: 'center' });

      yPos = 45;

      // Patient Info
      if (patientName) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Patient: ${patientName}`, margin, yPos);
        yPos += 10;
      }

      // Diagnosis Section
      pdf.setFillColor(240, 248, 255);
      pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      pdf.setTextColor(34, 139, 34);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'he' ? 'אבחנה / Diagnosis' : 'Diagnosis', margin + 2, yPos + 6);
      yPos += 12;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const diagnosisLines = pdf.splitTextToSize(diagnosis, pageWidth - margin * 2);
      pdf.text(diagnosisLines, margin, yPos);
      yPos += diagnosisLines.length * 5 + 10;

      // Acupuncture Points Section
      if (acupuncturePoints.length > 0) {
        pdf.setFillColor(240, 248, 255);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(34, 139, 34);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(language === 'he' ? 'פרוטוקול דיקור / Acupuncture Protocol' : 'Acupuncture Protocol', margin + 2, yPos + 6);
        yPos += 12;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const pointsText = acupuncturePoints.join(', ');
        const pointsLines = pdf.splitTextToSize(`Points: ${pointsText}`, pageWidth - margin * 2);
        pdf.text(pointsLines, margin, yPos);
        yPos += pointsLines.length * 5 + 10;
      }

      // Herbal Formula Section
      if (herbalFormula || herbalIngredients.length > 0) {
        pdf.setFillColor(240, 248, 255);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(34, 139, 34);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(language === 'he' ? 'מרשם צמחי / Herbal Prescription' : 'Herbal Prescription', margin + 2, yPos + 6);
        yPos += 12;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        if (herbalFormula) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Formula: ${herbalFormula}`, margin, yPos);
          yPos += 6;
          pdf.setFont('helvetica', 'normal');
        }

        if (herbalIngredients.length > 0) {
          pdf.text('Ingredients:', margin, yPos);
          yPos += 5;
          herbalIngredients.forEach((ing, i) => {
            pdf.text(`  • ${ing}`, margin, yPos);
            yPos += 5;
          });
        }
        yPos += 5;
      }

      // Check if we need a new page
      if (yPos > 230) {
        pdf.addPage();
        yPos = 20;
      }

      // Dietary Advice Section
      if (nutritionAdvice.length > 0) {
        pdf.setFillColor(240, 248, 255);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(34, 139, 34);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(language === 'he' ? 'המלצות תזונה / Dietary Recommendations' : 'Dietary Recommendations', margin + 2, yPos + 6);
        yPos += 12;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        nutritionAdvice.forEach((advice) => {
          const adviceLines = pdf.splitTextToSize(`✓ ${advice}`, pageWidth - margin * 2 - 5);
          pdf.text(adviceLines, margin, yPos);
          yPos += adviceLines.length * 5 + 2;
        });
        yPos += 5;
      }

      // Lifestyle Section
      if (lifestyleAdvice.length > 0) {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFillColor(240, 248, 255);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(34, 139, 34);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(language === 'he' ? 'אורח חיים / Lifestyle' : 'Lifestyle Recommendations', margin + 2, yPos + 6);
        yPos += 12;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        lifestyleAdvice.forEach((advice) => {
          const adviceLines = pdf.splitTextToSize(`✓ ${advice}`, pageWidth - margin * 2 - 5);
          pdf.text(adviceLines, margin, yPos);
          yPos += adviceLines.length * 5 + 2;
        });
      }

      // Try to add 3D body screenshot if canvas is available
      if (bodyCanvasRef?.current) {
        try {
          const canvas = bodyCanvasRef.current;
          const imgData = canvas.toDataURL('image/png');
          
          // Add new page for the body diagram
          pdf.addPage();
          yPos = 20;
          
          pdf.setFillColor(240, 248, 255);
          pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
          pdf.setTextColor(34, 139, 34);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Acupuncture Point Map', margin + 2, yPos + 6);
          yPos += 15;

          const imgWidth = pageWidth - margin * 2;
          const imgHeight = 150;
          pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
        } catch (err) {
          console.log('Could not add body image:', err);
        }
      }

      // Footer
      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount} | Generated by TCM Clinical Navigator | For professional use only`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `TCM_Protocol_${moduleName.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

      toast.success(language === 'he' ? 'PDF נוצר בהצלחה' : 'PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(language === 'he' ? 'שגיאה ביצירת PDF' : 'Error generating PDF');
    } finally {
      setIsGenerating(false);
    }
  }, [
    patientName,
    moduleName,
    diagnosis,
    acupuncturePoints,
    herbalFormula,
    herbalIngredients,
    nutritionAdvice,
    lifestyleAdvice,
    bodyCanvasRef,
    language,
  ]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={isGenerating}
      className="gap-1"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {language === 'he' ? 'הורד PDF' : 'Download PDF'}
    </Button>
  );
}
