'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { FilePen, Save } from 'lucide-react';
import { PlannerItem as PlannerItemType } from '@/lib/types';
import EditPlannerItem from './edit-planner-item';
import { Separator } from '../ui/separator';
import { useLocale } from '@/hooks/use-locale';
import React from 'react';

interface EditPlannerSheetProps {
  schedule: Omit<PlannerItemType, 'onUpdate'>[];
  onUpdate: (item: PlannerItemType) => void;
  onSave: () => void;
  triggerText: string;
}

export function EditPlannerSheet({
  schedule,
  onUpdate,
  onSave,
  triggerText,
}: EditPlannerSheetProps) {
  const { t } = useLocale();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <FilePen className="mr-2" /> {triggerText}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('dashboard.editTitle')}</SheetTitle>
          <SheetDescription>
            {t('dashboard.editDescription')}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {schedule.map((item, index) => (
            <React.Fragment key={item.id}>
              <EditPlannerItem item={item as PlannerItemType} onUpdate={onUpdate} />
              {index < schedule.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={onSave}><Save className="mr-2" />{t('dashboard.save')}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
