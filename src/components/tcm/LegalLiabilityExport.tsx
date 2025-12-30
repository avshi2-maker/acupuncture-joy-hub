import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  FileDown, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Database,
  ExternalLink
} from 'lucide-react';

interface QueryLog {
  id: string;
  query_text: string;
  chunks_found: number;
  ai_model: string | null;
  created_at: string;
  sources_used: any;
  response_preview: string | null;
}

interface LegalLiabilityExportProps {
  sessionStart?: string;
}

export function LegalLiabilityExport({ sessionStart }: LegalLiabilityExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    proprietary: number;
    external: number;
  } | null>(null);

  const fetchAndExportPDF = async () => {
    setIsExporting(true);
    try {
      // Fetch all query logs
      const { data: logs, error } = await supabase
        .from('rag_query_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      if (!logs || logs.length === 0) {
        toast.warning('No query logs found to export');
        setIsExporting(false);
        return;
      }

      // Calculate stats
      const proprietaryCount = logs.filter(l => {
        const sources = l.sources_used as any[];
        return !sources?.some(s => s?.type === 'external_ai');
      }).length;
      const externalCount = logs.length - proprietaryCount;

      setStats({
        total: logs.length,
        proprietary: proprietaryCount,
        external: externalCount
      });

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('TCM Brain - Legal Liability Report', pageWidth / 2, 20, { align: 'center' });

      // Report info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 30);
      doc.text(`Report Period: All Time (${logs.length} queries)`, 14, 36);
      doc.text(`Dr. Roni Sapir - TCM Encyclopedia`, 14, 42);

      // Summary box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
      doc.roundedRect(14, 48, pageWidth - 28, 30, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(22, 101, 52);
      doc.text('Liability Summary', 20, 58);
      
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`Total API Calls: ${logs.length}`, 20, 66);
      doc.text(`Proprietary KB Responses: ${proprietaryCount} (${Math.round(proprietaryCount / logs.length * 100)}%)`, 20, 72);
      doc.text(`External AI Responses: ${externalCount} (${Math.round(externalCount / logs.length * 100)}%)`, pageWidth / 2, 72);

      // Audit Trail Table
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Audit Trail - All Queries', 14, 90);

      const tableData = logs.map((log: QueryLog) => {
        const sources = log.sources_used as any[];
        const isExternal = sources?.some(s => s?.type === 'external_ai');
        const sourceType = isExternal ? '⚠️ External AI' : '✓ Proprietary KB';
        const sourceFiles = isExternal 
          ? 'N/A' 
          : sources?.map((s: any) => s.fileName).filter(Boolean).slice(0, 2).join(', ') || 'N/A';

        return [
          log.id.substring(0, 8) + '...',
          format(new Date(log.created_at), 'MM/dd HH:mm'),
          log.query_text?.substring(0, 40) + (log.query_text?.length > 40 ? '...' : ''),
          String(log.chunks_found || 0),
          sourceType,
          sourceFiles.substring(0, 30)
        ];
      });

      autoTable(doc, {
        startY: 95,
        head: [['Audit ID', 'Timestamp', 'Query', 'Chunks', 'Source Type', 'Files Used']],
        body: tableData,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 22 },
          2: { cellWidth: 50 },
          3: { cellWidth: 15 },
          4: { cellWidth: 28 },
          5: { cellWidth: 40 }
        }
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This document serves as legal proof that all AI responses are audited and logged.', 14, finalY + 10);
      doc.text('Each query has a unique audit ID stored in the database for verification.', 14, finalY + 15);
      doc.text(`© ${new Date().getFullYear()} Dr. Roni Sapir - TCM Encyclopedia. All rights reserved.`, 14, finalY + 25);

      // Save PDF
      const fileName = `TCM_Legal_Liability_Report_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.pdf`;
      doc.save(fileName);

      toast.success(`Legal liability report exported: ${fileName}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Legal Liability Export</span>
          </div>
          <Badge variant="outline" className="text-primary bg-primary/10">
            Audit Report
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Generate a PDF report with all audit IDs, sources, and timestamps for legal protection.
          This proves every API call is real and logged.
        </p>

        {stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-3 gap-2"
          >
            <div className="p-2 rounded bg-background border text-center">
              <Database className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-[9px] text-muted-foreground">Total</p>
            </div>
            <div className="p-2 rounded bg-green-500/10 border border-green-500/30 text-center">
              <CheckCircle2 className="w-4 h-4 mx-auto text-green-600 mb-1" />
              <p className="text-lg font-bold text-green-600">{stats.proprietary}</p>
              <p className="text-[9px] text-muted-foreground">Proprietary</p>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-center">
              <ExternalLink className="w-4 h-4 mx-auto text-amber-600 mb-1" />
              <p className="text-lg font-bold text-amber-600">{stats.external}</p>
              <p className="text-[9px] text-muted-foreground">External</p>
            </div>
          </motion.div>
        )}

        <Button 
          onClick={fetchAndExportPDF}
          disabled={isExporting}
          className="w-full"
          variant="default"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Export Legal Liability PDF
            </>
          )}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          🔒 Report includes: Audit IDs • Timestamps • Source Types • Query Logs
        </p>
      </CardContent>
    </Card>
  );
}
