import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Shield,
  Database,
  XCircle
} from 'lucide-react';

interface SourceTypeAlertProps {
  isVisible: boolean;
  sourceType: 'proprietary' | 'external' | 'no-match' | null;
  chunksFound?: number;
  auditLogId?: string | null;
}

export function SourceTypeAlert({ isVisible, sourceType, chunksFound = 0, auditLogId }: SourceTypeAlertProps) {
  if (!sourceType) return null;

  const alertConfig = {
    proprietary: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      title: '✓ Proprietary Knowledge Base',
      description: `Response generated from Dr. Sapir's verified clinical materials. ${chunksFound} chunks matched.`,
      className: 'border-green-500/50 bg-green-500/10',
      badgeClass: 'bg-green-600 text-white',
      badgeText: 'VERIFIED KB'
    },
    external: {
      icon: <ExternalLink className="w-5 h-5 text-amber-600" />,
      title: '⚠️ External AI Response',
      description: 'Response from external AI. NOT from Dr. Sapir\'s verified materials. User accepted liability.',
      className: 'border-amber-500/50 bg-amber-500/10',
      badgeClass: 'bg-amber-600 text-white',
      badgeText: 'EXTERNAL AI'
    },
    'no-match': {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      title: '⚠️ No Knowledge Base Match',
      description: 'No matching entries found in proprietary knowledge base. Using general AI knowledge.',
      className: 'border-red-500/50 bg-red-500/10',
      badgeClass: 'bg-red-600 text-white',
      badgeText: 'NO KB MATCH'
    }
  };

  const config = alertConfig[sourceType];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Alert className={`${config.className} border-2 shadow-lg`}>
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              >
                {config.icon}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <AlertTitle className="text-sm font-semibold">
                    {config.title}
                  </AlertTitle>
                  <Badge className={config.badgeClass}>
                    {config.badgeText}
                  </Badge>
                </div>
                <AlertDescription className="text-xs mt-1 text-muted-foreground">
                  {config.description}
                </AlertDescription>
                {auditLogId && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Audit: {auditLogId.substring(0, 8)}...</span>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
