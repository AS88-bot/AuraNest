'use client';
import { useState } from 'react';
import type { NavigationStep } from './map-view';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface EditRouteItemProps {
  step: NavigationStep;
  onUpdate: (updatedStep: NavigationStep) => void;
}

export default function EditRouteItem({ step, onUpdate }: EditRouteItemProps) {
  const [instruction, setInstruction] = useState(step.instruction);
  const [distance, setDistance] = useState(step.distance);

  const handleBlur = () => {
    onUpdate({
      ...step,
      instruction,
      distance,
    });
  };

  return (
    <div className="grid gap-4">
        <h4 className="font-semibold text-lg text-primary">Step {step.id}</h4>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`instruction-${step.id}`} className="text-right">
          Instruction
        </Label>
        <Input
          id={`instruction-${step.id}`}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onBlur={handleBlur}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`distance-${step.id}`} className="text-right">
          Distance
        </Label>
        <Input
          id={`distance-${step.id}`}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          onBlur={handleBlur}
          className="col-span-3"
        />
      </div>
    </div>
  );
}
