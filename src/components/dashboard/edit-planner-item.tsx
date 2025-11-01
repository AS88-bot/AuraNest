'use client';
import { useState } from 'react';
import { PlannerItem as PlannerItemType } from '@/lib/types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useLocale } from '@/hooks/use-locale';

interface EditPlannerItemProps {
  item: PlannerItemType;
  onUpdate: (updatedItem: PlannerItemType) => void;
}

export default function EditPlannerItem({ item, onUpdate }: EditPlannerItemProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState(t(item.titleKey));
  const [time, setTime] = useState(item.time);
  const [description, setDescription] = useState(t(item.descriptionKey));

  // This is tricky because we would need to save the new text back to the translation files
  // or handle it in a different way. For now, editing will only update the local state.
  const handleBlur = () => {
    // onUpdate({
    //   ...item,
    //   title,
    //   time,
    //   description,
    // });
  };

  return (
    <div className="grid gap-4">
        <h4 className="font-semibold text-lg text-primary">{t(item.titleKey)} ({item.category})</h4>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`time-${item.id}`} className="text-right">
          Time
        </Label>
        <Input
          id={`time-${item.id}`}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onBlur={handleBlur}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`title-${item.id}`} className="text-right">
          Title
        </Label>
        <Input
          id={`title-${item.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`description-${item.id}`} className="text-right">
          Description
        </Label>
        <Textarea
          id={`description-${item.id}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleBlur}
          className="col-span-3"
        />
      </div>
    </div>
  );
}
