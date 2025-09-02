import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Goal } from "@/hooks/use-goals";
import { Filter } from "lucide-react";

interface CategoriesCardProps {
  goals: Goal[];
  loading: boolean;
}

export const CategoriesCard = ({ goals, loading }: CategoriesCardProps) => {
  const categories = useMemo(() => {
    if (loading || !goals.length) return [];
    
    const categoryMap = new Map<string, number>();
    
    goals.forEach((goal) => {
      const category = goal.category || 'Sem categoria';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    const categoryColors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-orange-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    
    return Array.from(categoryMap.entries())
      .map(([category, count], index) => ({
        name: category,
        count,
        color: categoryColors[index % categoryColors.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [goals, loading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Categorias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${category.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {category.name}
                </span>
              </div>
              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                {category.count}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria encontrada
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};