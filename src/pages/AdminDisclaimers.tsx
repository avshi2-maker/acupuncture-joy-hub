import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  User,
  Award,
  Calendar
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface Disclaimer {
  id: string;
  user_id: string | null;
  therapist_name: string;
  license_number: string;
  language: string;
  signature_url: string | null;
  signed_at: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminDisclaimers() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDisclaimers();
    }
  }, [isAdmin]);

  const fetchDisclaimers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('therapist_disclaimers')
        .select('*')
        .order('signed_at', { ascending: false });

      if (error) throw error;
      setDisclaimers(data || []);
    } catch (error) {
      console.error('Error fetching disclaimers:', error);
      toast.error('Failed to load disclaimers');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpirationStatus = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const warningDate = addDays(now, 30);

    if (isBefore(expiry, now)) {
      return { status: 'expired', label: 'Expired', variant: 'destructive' as const };
    } else if (isBefore(expiry, warningDate)) {
      return { status: 'expiring', label: 'Expiring Soon', variant: 'secondary' as const };
    }
    return { status: 'valid', label: 'Valid', variant: 'default' as const };
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'he': return '🇮🇱';
      case 'ru': return '🇷🇺';
      default: return '🇺🇸';
    }
  };

  const filteredDisclaimers = disclaimers.filter(d => 
    d.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: disclaimers.length,
    valid: disclaimers.filter(d => getExpirationStatus(d.expires_at).status === 'valid').length,
    expiring: disclaimers.filter(d => getExpirationStatus(d.expires_at).status === 'expiring').length,
    expired: disclaimers.filter(d => getExpirationStatus(d.expires_at).status === 'expired').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-jade" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Helmet>
        <title>Signed Disclaimers | Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-jade" />
                Signed Disclaimers
              </h1>
              <p className="text-muted-foreground">View and manage therapist legal disclaimers</p>
            </div>
          </div>
          <Button onClick={fetchDisclaimers} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-jade/10 rounded-lg">
                  <Shield className="h-5 w-5 text-jade" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Signed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.valid}</p>
                  <p className="text-sm text-muted-foreground">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expiring}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Disclaimers</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-jade" />
              </div>
            ) : filteredDisclaimers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No disclaimers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Therapist</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Signed</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisclaimers.map((disclaimer) => {
                      const expStatus = getExpirationStatus(disclaimer.expires_at);
                      return (
                        <TableRow key={disclaimer.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{disclaimer.therapist_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                {disclaimer.license_number}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg">{getLanguageFlag(disclaimer.language)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(disclaimer.signed_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(disclaimer.expires_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={expStatus.variant} className={
                              expStatus.status === 'valid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                              expStatus.status === 'expiring' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                              ''
                            }>
                              {expStatus.status === 'valid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {expStatus.status === 'expiring' && <Clock className="h-3 w-3 mr-1" />}
                              {expStatus.status === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {expStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
