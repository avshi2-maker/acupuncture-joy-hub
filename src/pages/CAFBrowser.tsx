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
import { ScrollArea } from '@/components/ui/scroll-area';
import { CAFStudyCard } from '@/components/caf/CAFStudyCard';
import { ArrowLeft, Search, Filter, Brain, Database, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface CAFStudy {
  id: number;
  system_category: string;
  western_label: string;
  tcm_pattern: string;
  key_symptoms: string | null;
  pulse_tongue: string | null;
  treatment_principle: string | null;
  acupoints_display: string | null;
  pharmacopeia_formula: string | null;
  deep_thinking_note: string | null;
}

const SYSTEMS = [
  'All Systems',
  'Respiratory',
  'Digestive',
  'Cardiovascular',
  'Psychological',
  'Musculoskeletal',
  'Neurological',
  'Gynecology',
  'Dermatology',
  'Mens Health',
  'Metabolic',
  'Immunology',
  'Endocrine',
  'Eye/Ear',
  'Pain Management',
  'Addiction',
  'Pediatrics',
  'Internal',
  'Autoimmune',
  'Geriatrics',
  'Skin',
  'Acute',
  'Gastro',
  'Energy',
  'Sleep',
];

export default function CAFBrowser() {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState('All Systems');

  const { data: studies, isLoading, error } = useQuery({
    queryKey: ['caf-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('caf_master_studies')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return data as CAFStudy[];
    },
  });

  const filteredStudies = useMemo(() => {
    if (!studies) return [];

    return studies.filter((study) => {
      const matchesSystem = systemFilter === 'All Systems' || study.system_category === systemFilter;
      
      if (!search) return matchesSystem;

      const searchLower = search.toLowerCase();
      const matchesSearch =
        study.western_label.toLowerCase().includes(searchLower) ||
        study.tcm_pattern.toLowerCase().includes(searchLower) ||
        study.key_symptoms?.toLowerCase().includes(searchLower) ||
        study.acupoints_display?.toLowerCase().includes(searchLower) ||
        study.pharmacopeia_formula?.toLowerCase().includes(searchLower) ||
        study.deep_thinking_note?.toLowerCase().includes(searchLower);

      return matchesSystem && matchesSearch;
    });
  }, [studies, search, systemFilter]);

  const systemCounts = useMemo(() => {
    if (!studies) return {};
    return studies.reduce((acc, study) => {
      acc[study.system_category] = (acc[study.system_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [studies]);

  return (
    <>
      <Helmet>
        <title>CAF Clinical Browser | TCM-CAF</title>
        <meta name="description" content="Browse 50 comprehensive clinical frameworks bridging Western diagnoses with TCM pattern differentiation" />
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
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">CAF Clinical Browser</h1>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Ferrari Engine
            </Badge>
          </div>
        </header>

        <main className="container px-4 py-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{studies?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Clinical Studies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(systemCounts).length}</p>
                    <p className="text-xs text-muted-foreground">Body Systems</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{filteredStudies.length}</p>
                    <p className="text-xs text-muted-foreground">Matching</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">50</p>
                    <p className="text-xs text-muted-foreground">Deep Insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Master Clinical Logic Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                This is the "Ferrari" engine of your TCM-CAF application. Each study bridges Western medical labels 
                with TCM pattern differentiation, complete with the "Deep Thinking" clinical logic explaining 
                why you choose specific points and formulas.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={systemFilter === 'All Systems' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSystemFilter('All Systems')}
              className="h-8"
            >
              All ({studies?.length || 0})
            </Button>
            {Object.entries(systemCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([system, count]) => (
                <Button
                  key={system}
                  variant={systemFilter === system ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSystemFilter(system)}
                  className="h-8"
                >
                  {system} ({count})
                </Button>
              ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conditions, patterns, points, formulas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by system" />
              </SelectTrigger>
              <SelectContent>
                {SYSTEMS.map((system) => (
                  <SelectItem key={system} value={system}>
                    {system}
                    {system !== 'All Systems' && systemCounts[system] && (
                      <span className="ml-2 text-muted-foreground">({systemCounts[system]})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48 mt-2" />
                    <Skeleton className="h-4 w-36 mt-1" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Error loading CAF studies. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredStudies.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No studies match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredStudies.map((study) => (
                <CAFStudyCard key={study.id} study={study} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
