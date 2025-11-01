'use client';
import { Card, CardContent } from '@/components/ui/card';
import type { PlannerItem as PlannerItemType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, Pill, Smile, Utensils } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';

interface PlannerItemProps {
  item: PlannerItemType;
}

const categoryColors = {
    appointment: 'border-l-blue-400',
    medication: 'border-l-red-400',
    meal: 'border-l-yellow-400',
    activity: 'border-l-green-400',
};

const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    Pill: Pill,
    Utensils: Utensils,
    Calendar: Calendar,
    Smile: Smile,
};


export default function PlannerItem({ item }: PlannerItemProps) {
    const [isChecked, setIsChecked] = useState(item.isCompleted);
    const { t } = useLocale();

    const medicationImage = item.image ? PlaceHolderImages.find(p => p.id === item.image) : null;
    
    const Icon = icons[item.icon];
    const title = t(item.titleKey);
    const description = t(item.descriptionKey);

    return (
        <Card className={cn("overflow-hidden transition-all hover:shadow-md", categoryColors[item.category], 'border-l-8')}>
            <CardContent className="p-4 flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 text-muted-foreground w-24">
                    <span className="font-bold text-lg">{item.time}</span>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                         {Icon && <Icon className="h-8 w-8 text-foreground" />}
                        <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    </div>
                    <p className="text-lg text-muted-foreground">{description}</p>
                    {medicationImage && (
                        <div className="mt-2">
                            <Image 
                                src={medicationImage.imageUrl} 
                                alt={medicationImage.description} 
                                width={100} 
                                height={100}
                                className="rounded-lg"
                                data-ai-hint={medicationImage.imageHint}
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center h-full pl-4">
                    <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => setIsChecked(!isChecked)}
                        className="h-10 w-10 border-4"
                        aria-label={`Mark ${title} as completed`}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
