import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Brain, 
  Activity, 
  Stethoscope, 
  Heart, 
  Leaf, 
  Pill,
  FileText,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Edit2,
  User
} from 'lucide-react';
import { toast } from 'sonner';

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  questions: string[];
  isCustom?: boolean;
}

// Custom template stored in localStorage (without icon)
interface StoredCustomTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: string[];
  isCustom: true;
}

const CUSTOM_TEMPLATES_KEY = 'tcm_custom_templates';

export const defaultTemplates: SessionTemplate[] = [
  {
    id: 'insomnia',
    name: 'Insomnia Assessment',
    description: 'Complete sleep disorder evaluation',
    icon: Moon,
    category: 'Sleep',
    questions: [
      'Any difficulty falling asleep?',
      'Any night wakings?',
      'Any excessive dreams?',
      'Sleep quality assessment?',
      'What time do you go to bed?',
      'How many hours of sleep per night?',
      'Any Heart Yin deficiency?',
      'Any Blood deficiency present?',
      'Any anxiety or excessive worry?',
      'Current stress level?',
      'What is the main treatment principle?',
      'What acupuncture points recommended?',
      'Should moxibustion be used?',
      'Any sleep recommendations?',
      'Any meditation recommendations?'
    ]
  },
  {
    id: 'anxiety',
    name: 'Anxiety & Stress',
    description: 'Mental health and emotional assessment',
    icon: Brain,
    category: 'Mental',
    questions: [
      'Any anxiety or excessive worry?',
      'Any depression symptoms?',
      'Current emotional state?',
      'Current stress level?',
      'Any irritability present?',
      'Any palpitations or chest tightness?',
      'Any Qi stagnation?',
      'What is Liver condition?',
      'What is Heart condition?',
      'Any emotional treatment needed?',
      'Any breathing exercises recommended?',
      'Any Qi Gong exercises recommended?',
      'What acupuncture points recommended?',
      'Any meditation recommendations?',
      'Any stress management tips?'
    ]
  },
  {
    id: 'chronic-pain',
    name: 'Chronic Pain',
    description: 'Pain management and assessment',
    icon: Activity,
    category: 'Pain',
    questions: [
      'Any pain present? Where?',
      'Is the pain constant or intermittent?',
      'Pain character? (sharp, dull, stabbing)',
      'What aggravates the pain?',
      'What relieves the pain?',
      'When did symptoms begin?',
      'Any Blood stagnation?',
      'Any Qi stagnation?',
      'Any Cold pathogen present?',
      'Any Dampness pathogen?',
      'Which meridian is involved?',
      'What acupuncture points recommended?',
      'Should cupping be used?',
      'Should Gua Sha be used?',
      'Should electro-acupuncture be used?'
    ]
  },
  {
    id: 'digestive',
    name: 'Digestive Issues',
    description: 'GI and digestion assessment',
    icon: Stethoscope,
    category: 'Digestion',
    questions: [
      'How is the appetite?',
      'Any bloating or swelling?',
      'Any constipation or diarrhea?',
      'Any nausea present?',
      'Any excessive thirst?',
      'Stool frequency and quality?',
      'Eating habits and patterns?',
      'What is Spleen condition?',
      'Any Dampness pathogen?',
      'Any Qi deficiency present?',
      'Any foods to avoid?',
      'Any foods to add?',
      'What acupuncture points recommended?',
      'Recommended herbal formula?',
      'Any tea or soup recommendations?'
    ]
  },
  {
    id: 'womens-health',
    name: "Women's Health",
    description: 'Menstrual and reproductive assessment',
    icon: Heart,
    category: 'Women',
    questions: [
      'Any menstrual cycle issues? (women)',
      'Any menstrual pain? (women)',
      'Any discharge present? (women)',
      'Any Blood deficiency present?',
      'Any Blood stagnation?',
      'What is Liver condition?',
      'What is Kidney condition?',
      'Any Cold pathogen present?',
      'Any Qi stagnation?',
      'What is the main treatment principle?',
      'What acupuncture points recommended?',
      'Should moxibustion be used?',
      'Recommended herbal formula?',
      'Any lifestyle recommendations?',
      'Any foods to add?'
    ]
  },
  {
    id: 'fatigue',
    name: 'Fatigue & Energy',
    description: 'Energy deficiency assessment',
    icon: Leaf,
    category: 'Energy',
    questions: [
      'Any chronic fatigue present?',
      'What is the energy level?',
      'What time of day is fatigue worse?',
      'Sleep quality assessment?',
      'How is the appetite?',
      'Any Qi deficiency present?',
      'Any Yang deficiency?',
      'Any Blood deficiency present?',
      'What is Spleen condition?',
      'What is Kidney condition?',
      'Tonify or disperse approach?',
      'Warm or cool approach?',
      'What acupuncture points recommended?',
      'Recommended herbal formula?',
      'Any exercise recommendations?'
    ]
  },
  {
    id: 'headache',
    name: 'Headache & Migraine',
    description: 'Head pain assessment',
    icon: Pill,
    category: 'Head',
    questions: [
      'Any headaches present?',
      'Where is the headache located?',
      'Is the pain constant or intermittent?',
      'Pain character? (sharp, dull, stabbing)',
      'What aggravates the pain?',
      'What relieves the pain?',
      'Any dizziness or vertigo?',
      'Any vision problems?',
      'Any Wind pathogen?',
      'What is Liver condition?',
      'Any Blood stagnation?',
      'Which meridian is involved?',
      'What acupuncture points recommended?',
      'Any scalp points recommended?',
      'Any preventive treatment available?'
    ]
  },
  {
    id: 'initial-intake',
    name: 'Initial Intake',
    description: 'Comprehensive first visit assessment',
    icon: FileText,
    category: 'General',
    questions: [
      'What is the main symptom?',
      'When did symptoms begin?',
      'Any pre-existing conditions?',
      'Current medication use?',
      'Any allergies present?',
      'Pulse quality? (fast, slow, weak)',
      'Tongue condition? (color, coating)',
      'Current stress level?',
      'Sleep quality assessment?',
      'How is the appetite?',
      'Any physical exercise routine?',
      'What is the main imbalance pattern?',
      'Which organ is primarily affected?',
      'What is the main treatment principle?',
      'Expected treatment duration?'
    ]
  }
];

// For backward compatibility
export const sessionTemplates = defaultTemplates;

interface SessionTemplatesProps {
  onApplyTemplate: (template: SessionTemplate) => void;
  trigger?: React.ReactNode;
}

export const SessionTemplates: React.FC<SessionTemplatesProps> = ({ 
  onApplyTemplate,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [customTemplates, setCustomTemplates] = useState<StoredCustomTemplate[]>([]);
  
  // New template form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newQuestions, setNewQuestions] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load custom templates from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      if (saved) {
        setCustomTemplates(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom templates:', e);
    }
  }, []);

  // Save custom templates to localStorage
  const saveCustomTemplates = useCallback((templates: StoredCustomTemplate[]) => {
    setCustomTemplates(templates);
    try {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save custom templates:', e);
    }
  }, []);

  // Combine default and custom templates
  const allTemplates: SessionTemplate[] = [
    ...defaultTemplates,
    ...customTemplates.map(ct => ({
      ...ct,
      icon: User // Custom templates get User icon
    }))
  ];

  const categories = [...new Set(allTemplates.map(t => t.category))];

  const handleApply = (template: SessionTemplate) => {
    onApplyTemplate(template);
    setOpen(false);
  };

  const resetForm = () => {
    setNewName('');
    setNewDescription('');
    setNewCategory('Custom');
    setNewQuestions('');
    setEditingId(null);
  };

  const handleSaveTemplate = () => {
    if (!newName.trim()) {
      toast.error('Template name is required');
      return;
    }
    
    const questionsArray = newQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);
    
    if (questionsArray.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    const template: StoredCustomTemplate = {
      id: editingId || `custom-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim() || 'Custom template',
      category: newCategory.trim() || 'Custom',
      questions: questionsArray,
      isCustom: true
    };

    if (editingId) {
      // Update existing
      const updated = customTemplates.map(t => t.id === editingId ? template : t);
      saveCustomTemplates(updated);
      toast.success('Template updated');
    } else {
      // Add new
      saveCustomTemplates([...customTemplates, template]);
      toast.success('Template saved');
    }

    resetForm();
    setActiveTab('browse');
  };

  const handleEditTemplate = (template: StoredCustomTemplate) => {
    setNewName(template.name);
    setNewDescription(template.description);
    setNewCategory(template.category);
    setNewQuestions(template.questions.join('\n'));
    setEditingId(template.id);
    setActiveTab('create');
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = customTemplates.filter(t => t.id !== id);
    saveCustomTemplates(updated);
    toast.success('Template deleted');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-jade" />
            Session Templates
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'create')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="create" className="gap-1">
              <Plus className="h-3 w-3" />
              {editingId ? 'Edit Template' : 'Create New'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4">
            <ScrollArea className="h-[55vh] pr-4">
              <div className="space-y-6">
                {categories.map(category => {
                  const categoryTemplates = allTemplates.filter(t => t.category === category);
                  const hasCustom = categoryTemplates.some(t => t.isCustom);
                  
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        {category}
                        {hasCustom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                      </h3>
                      <div className="grid gap-3">
                        {categoryTemplates.map(template => (
                          <Card 
                            key={template.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors group"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div 
                                  className="flex items-start gap-3 flex-1"
                                  onClick={() => handleApply(template)}
                                >
                                  <div className={`p-2 rounded-lg ${template.isCustom ? 'bg-primary/10' : 'bg-jade/10'}`}>
                                    <template.icon className={`h-5 w-5 ${template.isCustom ? 'text-primary' : 'text-jade'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base mb-1 flex items-center gap-2">
                                      {template.name}
                                      {template.isCustom && (
                                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                                      )}
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                      {template.description}
                                    </CardDescription>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {template.questions.length} questions
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {template.isCustom && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditTemplate(template as StoredCustomTemplate);
                                        }}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTemplate(template.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="create" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name *</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Shoulder Pain Protocol"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Pain, Sleep, Custom"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of this template"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Questions (one per line) *</label>
                <Textarea
                  value={newQuestions}
                  onChange={(e) => setNewQuestions(e.target.value)}
                  placeholder="Any pain present?&#10;Where is the pain located?&#10;Is pain constant or intermittent?&#10;What aggravates the pain?"
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {newQuestions.split('\n').filter(q => q.trim()).length} questions added
                </p>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
              <Button onClick={handleSaveTemplate} className="gap-2">
                <Save className="h-4 w-4" />
                {editingId ? 'Update Template' : 'Save Template'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
