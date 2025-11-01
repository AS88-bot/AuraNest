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
import type { NavigationStep } from './map-view';
import EditRouteItem from './edit-route-item';
import { Separator } from '../ui/separator';

interface EditRouteSheetProps {
  route: NavigationStep[];
  onUpdate: (item: NavigationStep) => void;
}

export function EditRouteSheet({
  route,
  onUpdate,
}: EditRouteSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FilePen className="mr-2" /> Edit Route
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Guided Route</SheetTitle>
          <SheetDescription>
            Make changes to your route here. Changes are saved automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {route.map((step, index) => (
            <>
              <EditRouteItem key={step.id} step={step} onUpdate={onUpdate} />
              {index < route.length - 1 && <Separator />}
            </>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button><Save className="mr-2" />Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
