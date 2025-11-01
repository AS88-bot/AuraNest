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

interface EditPlannerSheetProps {
  schedule: PlannerItemType[];
  onUpdate: (item: PlannerItemType) => void;
  onSave: () => void;
}

export function EditPlannerSheet({
  schedule,
  onUpdate,
  onSave,
}: EditPlannerSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <FilePen className="mr-2" /> Edit Plan
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Daily Plan</SheetTitle>
          <SheetDescription>
            Make changes to your daily schedule here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {schedule.map((item, index) => (
            <>
              <EditPlannerItem key={item.id} item={item} onUpdate={onUpdate} />
              {index < schedule.length - 1 && <Separator />}
            </>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={onSave}><Save className="mr-2" />Save Changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
