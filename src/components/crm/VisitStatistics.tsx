import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Users, Activity, Calendar, TrendingUp } from 'lucide-react';

interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint: string | null;
  tcm_pattern: string | null;
  points_used: string[] | null;
  cupping: boolean;
  moxa: boolean;
}

interface FollowUp {
  id: string;
  status: string;
  scheduled_date: string;
}

interface Patient {
  id: string;
  gender: string | null;
}

interface VisitStatisticsProps {
  patients: Patient[];
  allVisits: Visit[];
  allFollowUps: FollowUp[];
}

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(142, 50%, 50%)', 'hsl(142, 40%, 65%)', 'hsl(200, 60%, 50%)', 'hsl(280, 50%, 55%)', 'hsl(30, 70%, 55%)'];

export function VisitStatistics({ patients, allVisits, allFollowUps }: VisitStatisticsProps) {
  const stats = useMemo(() => {
    // Treatment techniques distribution
    const techniques = {
      'דיקור': allVisits.filter(v => v.points_used && v.points_used.length > 0).length,
      'כוסות רוח': allVisits.filter(v => v.cupping).length,
      'מוקסה': allVisits.filter(v => v.moxa).length,
    };

    const techniquesData = Object.entries(techniques)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    // TCM patterns distribution
    const patternCounts: Record<string, number> = {};
    allVisits.forEach(v => {
      if (v.tcm_pattern) {
        const pattern = v.tcm_pattern.trim();
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      }
    });
    const patternsData = Object.entries(patternCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Chief complaints distribution
    const complaintCounts: Record<string, number> = {};
    allVisits.forEach(v => {
      if (v.chief_complaint) {
        const complaint = v.chief_complaint.trim().substring(0, 30);
        complaintCounts[complaint] = (complaintCounts[complaint] || 0) + 1;
      }
    });
    const complaintsData = Object.entries(complaintCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Follow-up rates
    const completedFollowUps = allFollowUps.filter(f => f.status === 'completed').length;
    const pendingFollowUps = allFollowUps.filter(f => f.status === 'pending').length;
    const followUpRate = allFollowUps.length > 0 
      ? Math.round((completedFollowUps / allFollowUps.length) * 100) 
      : 0;

    const followUpData = [
      { name: 'הושלמו', value: completedFollowUps },
      { name: 'ממתינים', value: pendingFollowUps },
    ].filter(item => item.value > 0);

    // Gender distribution
    const genderCounts: Record<string, number> = {};
    patients.forEach(p => {
      const gender = p.gender === 'male' ? 'זכר' : p.gender === 'female' ? 'נקבה' : p.gender === 'other' ? 'אחר' : 'לא צוין';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    const genderData = Object.entries(genderCounts)
      .map(([name, value]) => ({ name, value }));

    // Monthly visits trend
    const monthlyVisits: Record<string, number> = {};
    allVisits.forEach(v => {
      const month = v.visit_date.substring(0, 7); // YYYY-MM
      monthlyVisits[month] = (monthlyVisits[month] || 0) + 1;
    });
    const monthlyData = Object.entries(monthlyVisits)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month: month.substring(5), // Show only MM
        visits: count
      }));

    // Most used points
    const pointCounts: Record<string, number> = {};
    allVisits.forEach(v => {
      if (v.points_used) {
        v.points_used.forEach(point => {
          const p = point.trim();
          if (p) pointCounts[p] = (pointCounts[p] || 0) + 1;
        });
      }
    });
    const pointsData = Object.entries(pointCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      totalPatients: patients.length,
      totalVisits: allVisits.length,
      avgVisitsPerPatient: patients.length > 0 ? (allVisits.length / patients.length).toFixed(1) : '0',
      followUpRate,
      techniquesData,
      patternsData,
      complaintsData,
      followUpData,
      genderData,
      monthlyData,
      pointsData
    };
  }, [patients, allVisits, allFollowUps]);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סה"כ מטופלים</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סה"כ ביקורים</p>
                <p className="text-2xl font-bold">{stats.totalVisits}</p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ביקורים לכל מטופל</p>
                <p className="text-2xl font-bold">{stats.avgVisitsPerPatient}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">אחוז מעקבים שהושלמו</p>
                <p className="text-2xl font-bold">{stats.followUpRate}%</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Treatment Techniques */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">טכניקות טיפול</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.techniquesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.techniquesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.techniquesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            )}
          </CardContent>
        </Card>

        {/* Follow-up Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">סטטוס מעקבים</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.followUpData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.followUpData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="hsl(142, 76%, 36%)" />
                    <Cell fill="hsl(45, 90%, 55%)" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">אין מעקבים</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* TCM Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">דפוסים נפוצים (TCM)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.patternsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.patternsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            )}
          </CardContent>
        </Card>

        {/* Most Used Points */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">נקודות נפוצות</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pointsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.pointsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(200, 60%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Visits Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">מגמת ביקורים חודשית</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">התפלגות מטופלים לפי מין</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chief Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">תלונות עיקריות נפוצות</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.complaintsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.complaintsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(280, 50%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">אין נתונים</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}