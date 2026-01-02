import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Database, FlaskConical, Star, ExternalLink, Users, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Tables } from '@/integrations/supabase/types';

type ClinicalTrial = Tables<'clinical_trials'>;

const STATUS_OPTIONS = ['All', 'completed', 'recruiting', 'active'];

export default function ClinicalTrialsBrowser() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: trials, isLoading, error } = useQuery({
    queryKey: ['clinical-trials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_trials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClinicalTrial[];
    },
  });

  const filteredTrials = useMemo(() => {
    if (!trials) return [];

    return trials.filter((trial) => {
      const matchesStatus = statusFilter === 'All' || trial.study_status === statusFilter;
      const matchesVerified = !verifiedOnly || trial.sapir_verified;
      
      if (!search) return matchesStatus && matchesVerified;

      const searchLower = search.toLowerCase();
      const matchesSearch =
        trial.title.toLowerCase().includes(searchLower) ||
        trial.condition.toLowerCase().includes(searchLower) ||
        trial.icd11_code?.toLowerCase().includes(searchLower) ||
        trial.intervention?.toLowerCase().includes(searchLower) ||
        trial.points_used?.some(p => p.toLowerCase().includes(searchLower)) ||
        trial.herbal_formula?.toLowerCase().includes(searchLower) ||
        trial.nct_id?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesVerified && matchesSearch;
    });
  }, [trials, search, statusFilter, verifiedOnly]);

  const stats = useMemo(() => {
    if (!trials) return { total: 0, verified: 0, completed: 0 };
    return {
      total: trials.length,
      verified: trials.filter(t => t.sapir_verified).length,
      completed: trials.filter(t => t.study_status === 'completed').length,
    };
  }, [trials]);

  return (
    <>
      <Helmet>
        <title>Clinical Trials Browser | TCM Evidence Base</title>
        <meta name="description" content="Browse acupuncture and TCM clinical trials from ClinicalTrials.gov with ICD-11 mapping" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Clinical Trials Browser</h1>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Database className="h-3 w-3" />
              ClinicalTrials.gov
            </Badge>
          </div>
        </header>

        <main className="container px-4 py-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Trials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.verified}</p>
                    <p className="text-xs text-muted-foreground">Sapir Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by condition, ICD-11, points, NCT ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All' ? 'All Status' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={verifiedOnly ? 'default' : 'outline'}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className="gap-2"
            >
              <Star className={`h-4 w-4 ${verifiedOnly ? 'fill-current' : ''}`} />
              Verified Only
            </Button>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-3/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Error loading trials. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredTrials.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No trials match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTrials.map((trial) => (
                <TrialCard key={trial.id} trial={trial} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function TrialCard({ trial }: { trial: ClinicalTrial }) {
  return (
    <Card className={trial.sapir_verified ? 'border-amber-500/50 bg-amber-500/5' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {trial.nct_id && (
                <Badge variant="outline" className="font-mono text-xs">
                  {trial.nct_id}
                </Badge>
              )}
              {trial.icd11_code && (
                <Badge variant="secondary" className="text-xs">
                  ICD-11: {trial.icd11_code}
                </Badge>
              )}
              {trial.sapir_verified && (
                <Badge className="bg-amber-500 text-white gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Sapir Verified
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{trial.title}</CardTitle>
            <CardDescription>{trial.condition}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {trial.intervention && (
            <div>
              <p className="text-muted-foreground text-xs">Intervention</p>
              <p className="font-medium">{trial.intervention}</p>
            </div>
          )}
          {trial.phase && (
            <div>
              <p className="text-muted-foreground text-xs">Phase</p>
              <p className="font-medium">{trial.phase}</p>
            </div>
          )}
          {trial.enrollment && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{trial.enrollment} participants</span>
            </div>
          )}
          {trial.study_status && (
            <div className="flex items-center gap-1">
              {trial.study_status === 'completed' ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : (
                <Clock className="h-3 w-3 text-amber-500" />
              )}
              <span className="capitalize">{trial.study_status}</span>
            </div>
          )}
        </div>

        {trial.points_used && trial.points_used.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs mb-1">Acupoints Used</p>
            <div className="flex flex-wrap gap-1">
              {trial.points_used.map((point, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {point}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {trial.herbal_formula && (
          <div>
            <p className="text-muted-foreground text-xs">Herbal Formula</p>
            <p className="text-sm font-medium">{trial.herbal_formula}</p>
          </div>
        )}

        {trial.results_summary && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-muted-foreground text-xs mb-1">Results Summary</p>
            <p className="text-sm">{trial.results_summary}</p>
          </div>
        )}

        {trial.efficacy_rating && (
          <Badge 
            variant={trial.efficacy_rating === 'positive' ? 'default' : 'secondary'}
            className={trial.efficacy_rating === 'positive' ? 'bg-emerald-500' : ''}
          >
            {trial.efficacy_rating}
          </Badge>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          {trial.citation && (
            <p className="text-xs text-muted-foreground italic truncate max-w-[70%]">
              {trial.citation}
            </p>
          )}
          {trial.source_url && (
            <a
              href={trial.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on ClinicalTrials.gov
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
