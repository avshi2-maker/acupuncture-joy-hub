import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Shield, Headphones, Megaphone, Brain, Globe, DollarSign } from 'lucide-react';

const FIXED_COSTS = [
  {
    name: 'Lovable Platform (Pro)',
    cost: 25,
    description: 'Hosting, deployment, CI/CD',
    icon: Server,
    color: 'jade',
  },
  {
    name: 'Database (Supabase)',
    cost: 10,
    description: 'PostgreSQL, Auth, Storage',
    icon: Shield,
    color: 'gold',
  },
  {
    name: 'Domain & SSL',
    cost: 2,
    description: 'Custom domain, certificates',
    icon: Globe,
    color: 'jade',
  },
  {
    name: 'Support Tools',
    cost: 8,
    description: 'Monitoring, analytics, help desk',
    icon: Headphones,
    color: 'crimson',
  },
  {
    name: 'AI Infrastructure Base',
    cost: 5,
    description: 'Base AI processing overhead',
    icon: Brain,
    color: 'gold',
  },
  {
    name: 'Marketing Base',
    cost: 10,
    description: 'Basic SEO, social presence',
    icon: Megaphone,
    color: 'jade',
  },
];

const TOTAL_FIXED = FIXED_COSTS.reduce((sum, item) => sum + item.cost, 0);

export function TotalCostsCard() {
  return (
    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-crimson" />
          Total Monthly Fixed Costs
          <Badge className="ml-auto bg-crimson/20 text-crimson border-crimson/30">
            ${TOTAL_FIXED}/mo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {FIXED_COSTS.map((item) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${item.color}/10 flex items-center justify-center`}>
                  <item.icon className={`h-4 w-4 text-${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${item.cost}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Fixed Monthly</p>
            <p className="text-xs text-muted-foreground">Before variable AI costs</p>
          </div>
          <p className="text-2xl font-bold text-crimson">${TOTAL_FIXED}</p>
        </div>

        <div className="mt-4 p-3 bg-jade/5 border border-jade/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Break-even:</p>
          <p className="text-sm">
            <span className="font-bold text-jade">~3 Practitioners</span> @ $25/mo or 
            <span className="font-bold text-jade ml-1">~8 Students</span> @ $8/mo
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          * Variable costs (AI queries) added on top based on usage
        </p>
      </CardContent>
    </Card>
  );
}
