import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Home,
  Brain,
  Heart,
  Palmtree,
  Eye,
  User,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatients } from '@/hooks/usePatients';
import { usePatientAssessments, useLatestAssessments, AssessmentType } from '@/hooks/usePatientAssessments';
import { format } from 'date-fns';

export default function Patient360() {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { data: assessments = [], isLoading: assessmentsLoading } = usePatientAssessments(selectedPatientId);
  const { data: latestResults } = useLatestAssessments(selectedPatientId);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const getTypeIcon = (type: AssessmentType) => {
    switch (type) {
      case 'brain': return <Brain className="h-4 w-4 text-violet-500" />;
      case 'body': return <Heart className="h-4 w-4 text-emerald-500" />;
      case 'retreat': return <Palmtree className="h-4 w-4 text-amber-500" />;
    }
  };

  const getTypeLabel = (type: AssessmentType) => {
    switch (type) {
      case 'brain': return 'Brain';
      case 'body': return 'Full Body';
      case 'retreat': return 'Retreat';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'saved': return <Badge variant="default" className="bg-emerald-500">✅ נשמר</Badge>;
      case 'sent': return <Badge variant="secondary" className="bg-blue-500 text-white">📨 נשלח</Badge>;
      case 'pending': return <Badge variant="outline">⏳ ממתין</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Helmet>
        <title>Patient 360° Health Record | תיק מטופל</title>
        <meta name="description" content="Comprehensive patient health record with all assessments and protocols" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                תיק מטופל (Patient 360°)
              </h1>
              <p className="text-muted-foreground">סיכום כלל האבחונים והמדדים הקליניים</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              חזרה לדשבורד
            </Button>
          </div>

          {/* Patient Selector */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">בחר מטופל:</span>
                {patientsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="בחר מטופל..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} {patient.phone ? `(${patient.phone})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedPatientId ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Brain Health Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`h-full ${latestResults?.brain ? 'border-violet-500/30 bg-violet-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-violet-500" />
                        🧠 בריאות המוח (אחרון)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.brain ? (
                        <>
                          <p className="text-2xl font-bold text-violet-600">
                            Score: {latestResults.brain.score ?? 'N/A'}/100
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            עודכן: {formatDate(latestResults.brain.created_at)}
                          </p>
                          {latestResults.brain.summary && (
                            <p className="text-sm mt-1">הערה: {latestResults.brain.summary}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא בוצע אבחון</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Body Health Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`h-full ${latestResults?.body ? 'border-emerald-500/30 bg-emerald-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-emerald-500" />
                        🧘 גוף מלא (אחרון)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.body ? (
                        <>
                          <p className="text-2xl font-bold text-emerald-600">
                            {latestResults.body.score ?? 15} המדדים
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            עודכן: {formatDate(latestResults.body.created_at)}
                          </p>
                          {latestResults.body.summary && (
                            <p className="text-sm mt-1">מיקוד: {latestResults.body.summary}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא בוצע אבחון</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Retreat Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className={`h-full ${latestResults?.retreat ? 'border-amber-500/30 bg-amber-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Palmtree className="h-5 w-5 text-amber-500" />
                        🏝️ ריטריט מומלץ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.retreat ? (
                        <>
                          <p className="text-2xl font-bold text-amber-600">
                            {latestResults.retreat.summary ?? 'Matched'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            הותאם: {formatDate(latestResults.retreat.created_at)}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא בוצע התאמה</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    היסטוריית אבחונים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assessmentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : assessments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך</TableHead>
                          <TableHead>סוג אבחון</TableHead>
                          <TableHead>תוצאות עיקריות</TableHead>
                          <TableHead>סטטוס</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessments.map(assessment => (
                          <TableRow key={assessment.id}>
                            <TableCell className="font-medium">
                              {formatDate(assessment.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(assessment.assessment_type)}
                                {getTypeLabel(assessment.assessment_type)}
                              </div>
                            </TableCell>
                            <TableCell>{assessment.summary || 'No summary'}</TableCell>
                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Eye className="h-3 w-3" />
                                צפה
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>אין אבחונים עדיין למטופל זה</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">בחר מטופל כדי לצפות בתיק שלו</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
