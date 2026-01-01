import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Baby,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  Pill,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInWeeks } from 'date-fns';

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  tongue_diagnosis: string | null;
  pulse_diagnosis: string | null;
  tcm_pattern: string | null;
  treatment_principle: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
  moxa: boolean | null;
  cupping: boolean | null;
  notes: string | null;
}

interface PregnancyTreatmentLogProps {
  patientId: string;
  patientName?: string;
  lmpDate?: Date;
  dueDate?: Date;
  className?: string;
}

export function PregnancyTreatmentLog({
  patientId,
  patientName,
  lmpDate,
  dueDate,
  className
}: PregnancyTreatmentLogProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisits() {
      if (!user || !patientId) return;

      setLoading(true);
      try {
        // Fetch visits for this patient during pregnancy period
        let query = supabase
          .from('visits')
          .select('*')
          .eq('patient_id', patientId)
          .eq('therapist_id', user.id)
          .order('visit_date', { ascending: false });

        // If we have LMP date, filter visits after that date
        if (lmpDate) {
          query = query.gte('visit_date', lmpDate.toISOString());
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setVisits(data || []);
      } catch (err) {
        console.error('Error fetching pregnancy visits:', err);
        setError('Failed to load treatment history');
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();
  }, [user, patientId, lmpDate]);

  const getGestationAtVisit = (visitDate: string) => {
    if (!lmpDate) return null;
    const weeks = differenceInWeeks(new Date(visitDate), lmpDate);
    return weeks;
  };

  const getTrimesterBadge = (weeks: number | null) => {
    if (weeks === null) return null;
    if (weeks <= 13) return { label: 'T1', color: 'bg-red-100 text-red-700 border-red-200' };
    if (weeks <= 26) return { label: 'T2', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'T3', color: 'bg-teal-100 text-teal-700 border-teal-200' };
  };

  const hasForbiddenPoints = (points: string[] | null) => {
    if (!points) return false;
    const forbidden = ['LI-4', 'LI4', 'SP-6', 'SP6', 'BL-60', 'BL60', 'BL-67', 'BL67', 'GB-21', 'GB21'];
    return points.some(p => forbidden.some(f => p.toUpperCase().includes(f.replace('-', ''))));
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-pink-200", className)}>
      <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5" />
          Pregnancy Treatment Log
          {patientName && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
              {patientName}
            </Badge>
          )}
        </CardTitle>
        {lmpDate && dueDate && (
          <div className="text-sm opacity-90 flex items-center gap-4 mt-1">
            <span>LMP: {format(lmpDate, 'MMM d, yyyy')}</span>
            <span>EDD: {format(dueDate, 'MMM d, yyyy')}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {visits.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Baby className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No treatments recorded during pregnancy</p>
            <p className="text-sm mt-1">Visits will appear here once recorded</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y">
              {visits.map((visit, index) => {
                const gestationWeeks = getGestationAtVisit(visit.visit_date);
                const trimester = getTrimesterBadge(gestationWeeks);
                const hasRiskyPoints = hasForbiddenPoints(visit.points_used);

                return (
                  <div
                    key={visit.id}
                    className={cn(
                      "p-4 hover:bg-muted/30 transition-colors",
                      hasRiskyPoints && "bg-red-50/50"
                    )}
                  >
                    {/* Visit Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(visit.visit_date), 'MMM d, yyyy')}
                        </span>
                        {gestationWeeks !== null && (
                          <Badge variant="outline" className="text-xs">
                            Week {gestationWeeks}
                          </Badge>
                        )}
                        {trimester && (
                          <Badge variant="outline" className={cn("text-xs", trimester.color)}>
                            {trimester.label}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        #{visits.length - index}
                      </span>
                    </div>

                    {/* Chief Complaint */}
                    {visit.chief_complaint && (
                      <div className="text-sm mb-2">
                        <span className="font-medium text-muted-foreground">CC:</span>{' '}
                        {visit.chief_complaint}
                      </div>
                    )}

                    {/* TCM Pattern */}
                    {visit.tcm_pattern && (
                      <div className="text-sm mb-2">
                        <span className="font-medium text-purple-600">Pattern:</span>{' '}
                        {visit.tcm_pattern}
                      </div>
                    )}

                    {/* Points Used */}
                    {visit.points_used && visit.points_used.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Points:</span>
                          {hasRiskyPoints && (
                            <Badge variant="destructive" className="text-[10px] h-4 px-1">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              Caution
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {visit.points_used.map((point, i) => {
                            const isRisky = ['LI-4', 'LI4', 'SP-6', 'SP6', 'BL-60', 'BL60', 'BL-67', 'BL67', 'GB-21', 'GB21']
                              .some(f => point.toUpperCase().includes(f.replace('-', '')));
                            return (
                              <Badge
                                key={i}
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  isRisky && "bg-red-100 text-red-700 border-red-300"
                                )}
                              >
                                {point}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Herbs */}
                    {visit.herbs_prescribed && (
                      <div className="text-sm mb-2 flex items-start gap-1">
                        <Pill className="h-3 w-3 mt-0.5 text-emerald-600" />
                        <span className="text-xs">{visit.herbs_prescribed}</span>
                      </div>
                    )}

                    {/* Modalities */}
                    {(visit.moxa || visit.cupping) && (
                      <div className="flex gap-2 mt-2">
                        {visit.moxa && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                            🔥 Moxa
                          </Badge>
                        )}
                        {visit.cupping && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            🫙 Cupping
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {visit.notes && (
                      <div className="text-xs text-muted-foreground mt-2 italic">
                        {visit.notes.substring(0, 100)}
                        {visit.notes.length > 100 && '...'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Summary */}
        {visits.length > 0 && (
          <div className="p-4 bg-muted/30 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <strong>{visits.length}</strong> visits
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {lmpDate && (
                    <>Week {differenceInWeeks(new Date(), lmpDate)}</>
                  )}
                </span>
              </div>
              {visits.some(v => hasForbiddenPoints(v.points_used)) && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Review flagged visits
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
