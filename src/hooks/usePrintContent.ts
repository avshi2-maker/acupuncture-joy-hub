import { useCallback } from 'react';

interface PrintOptions {
  title?: string;
  styles?: string;
}

export function usePrintContent() {
  const printContent = useCallback((contentElement: HTMLElement | null, options: PrintOptions = {}) => {
    if (!contentElement) {
      console.warn('No content element provided for printing');
      return;
    }

    const { title = 'Print', styles = '' } = options;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    // Get computed styles from the document
    const allStyles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle cross-origin stylesheets
          return '';
        }
      })
      .join('\n');

    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-bottom: 0.5em;
            color: #1a1a1a;
          }
          p {
            margin-bottom: 1em;
          }
          .print-header {
            border-bottom: 2px solid #10b981;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .print-header h1 {
            color: #10b981;
            font-size: 24px;
          }
          .print-header .date {
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background: #f5f5f5;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            background: #e5e7eb;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          ${styles}
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${title}</h1>
          <div class="date">${new Date().toLocaleDateString('he-IL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
        <div class="print-content">
          ${contentElement.innerHTML}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    };
  }, []);

  const printRef = useCallback((ref: React.RefObject<HTMLElement>, options: PrintOptions = {}) => {
    printContent(ref.current, options);
  }, [printContent]);

  return { printContent, printRef };
}
