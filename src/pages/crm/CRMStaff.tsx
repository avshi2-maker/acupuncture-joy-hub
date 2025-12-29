import { CRMLayout } from "@/components/crm/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Plus, Mail, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CRMStaff() {
  const { user } = useAuth();

  const { data: clinicStaff, isLoading } = useQuery({
    queryKey: ['clinic-staff', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinic_staff')
        .select(`
          *,
          clinics (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'therapist': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-6 w-6 text-jade" />
              Staff Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage clinic staff members and their roles
            </p>
          </div>
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
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
        ) : clinicStaff && clinicStaff.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinicStaff.map((staff) => (
              <Card key={staff.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Staff Member</CardTitle>
                    <Badge variant={getRoleBadgeVariant(staff.role)}>
                      {staff.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Clinic: {staff.clinics?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Status: {staff.is_active ? 'Active' : 'Inactive'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Staff Members Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Staff members will appear here once you create a clinic and add team members.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CRMLayout>
  );
}
