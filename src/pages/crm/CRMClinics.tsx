import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, MapPin, Phone, Mail, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CRMClinics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const { data: clinics, isLoading } = useQuery({
    queryKey: ['clinics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createClinicMutation = useMutation({
    mutationFn: async (clinicData: typeof newClinic) => {
      const { data, error } = await supabase
        .from('clinics')
        .insert({
          ...clinicData,
          owner_id: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      setIsDialogOpen(false);
      setNewClinic({ name: '', address: '', phone: '', email: '' });
      toast.success('Clinic created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create clinic: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinic.name.trim()) {
      toast.error('Clinic name is required');
      return;
    }
    createClinicMutation.mutate(newClinic);
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-jade" />
              Clinics
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your clinic locations and settings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Clinic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Clinic Name *</Label>
                  <Input
                    id="name"
                    value={newClinic.name}
                    onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                    placeholder="Enter clinic name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newClinic.address}
                    onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                    placeholder="Enter clinic address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClinic.phone}
                    onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClinic.email}
                    onChange={(e) => setNewClinic({ ...newClinic, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createClinicMutation.isPending}>
                    {createClinicMutation.isPending ? 'Creating...' : 'Create Clinic'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clinics && clinics.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => (
              <Card key={clinic.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{clinic.name}</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {clinic.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {clinic.address}
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {clinic.phone}
                    </div>
                  )}
                  {clinic.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {clinic.email}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Clinics Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first clinic to start managing locations and staff.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Clinic
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CRMLayout>
  );
}
