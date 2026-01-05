import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingUp } from "lucide-react";

const TIERS = [
  { id: "standard", name: "מסלול רגיל", value: 149, label: "Standard" },
  { id: "premium", name: "מסלול פרימיום", value: 249, label: "Premium" },
];

export default function TherapistROICalculator() {
  const navigate = useNavigate();
  const [price, setPrice] = useState(300);
  const [sessions, setSessions] = useState(80);
  const [expenses, setExpenses] = useState(2500);
  const [selectedTier, setSelectedTier] = useState("standard");

  const tierCost = TIERS.find(t => t.id === selectedTier)?.value || 149;
  const grossIncome = price * sessions;
  const netIncome = grossIncome - expenses - tierCost;

  const handleSelectTier = () => {
    navigate("/gate", { state: { selectedTier } });
  };

  return (
    <>
      <Helmet>
        <title>מחשבון פוטנציאל הכנסה | TCM Clinic</title>
        <meta name="description" content="חשב את פוטנציאל ההכנסה שלך כמטפל עם כלי ה-AI המתקדמים שלנו" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              חזרה
            </Button>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="font-semibold">מחשבון ROI</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              מחשבון פוטנציאל הכנסה
            </h1>
            <p className="text-muted-foreground">
              גלה כמה תוכל להרוויח עם הכלים שלנו
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-xl bg-card/95 backdrop-blur">
            <CardContent className="p-6 space-y-8">
              {/* Price Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">מחיר לטיפול</Label>
                  <span className="text-xl font-bold text-primary">
                    ₪{price.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[price]}
                  onValueChange={(v) => setPrice(v[0])}
                  min={150}
                  max={500}
                  step={10}
                  className="touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₪150</span>
                  <span>₪500</span>
                </div>
              </div>

              {/* Sessions Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">מספר טיפולים בחודש</Label>
                  <span className="text-xl font-bold text-primary">
                    {sessions}
                  </span>
                </div>
                <Slider
                  value={[sessions]}
                  onValueChange={(v) => setSessions(v[0])}
                  min={20}
                  max={200}
                  step={5}
                  className="touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20</span>
                  <span>200</span>
                </div>
              </div>

              {/* Expenses Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">הוצאות קבועות בחודש</Label>
                  <span className="text-xl font-bold text-primary">
                    ₪{expenses.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[expenses]}
                  onValueChange={(v) => setExpenses(v[0])}
                  min={1000}
                  max={5000}
                  step={100}
                  className="touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₪1,000</span>
                  <span>₪5,000</span>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">בחר מסלול</Label>
                <RadioGroup
                  value={selectedTier}
                  onValueChange={setSelectedTier}
                  className="flex gap-4"
                >
                  {TIERS.map((tier) => (
                    <div key={tier.id} className="flex-1">
                      <RadioGroupItem
                        value={tier.id}
                        id={tier.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={tier.id}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all touch-manipulation min-h-[80px]"
                      >
                        <span className="font-semibold text-sm">{tier.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          ₪{tier.value}/חודש
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Result Box */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    צפי הכנסה חודשית פנויה (לפני מס):
                  </span>
                </div>
                <div className="text-4xl font-extrabold text-primary">
                  ₪{netIncome.toLocaleString()}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleSelectTier}
                className="w-full min-h-[52px] text-lg font-semibold touch-manipulation"
                size="lg"
              >
                בחר מסלול והתחל
              </Button>

              {/* Disclaimer */}
              <p className="text-xs text-center text-muted-foreground">
                המחשה בלבד. התוצאות עשויות להשתנות בהתאם לביצועים בפועל.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
