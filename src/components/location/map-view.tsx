'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, Shield, Home, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { EditRouteSheet } from './edit-route-sheet';

const initialNavigationSteps = [
    { id: '1', instruction: 'Turn left onto Main Street.', distance: '50 ft' },
    { id: '2', instruction: 'Continue straight for 2 blocks.', distance: '0.2 mi' },
    { id: '3', instruction: 'Turn right onto Park Avenue.', distance: '0.5 mi' },
    { id: '4', instruction: 'Your destination will be on the left.', distance: '200 ft' }
];

export type NavigationStep = {
    id: string;
    instruction: string;
    distance: string;
};

export default function MapView() {
  const mapImage = PlaceHolderImages.find(p => p.id === 'map-placeholder');
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>(initialNavigationSteps);

  const handleUpdate = (updatedStep: NavigationStep) => {
    setNavigationSteps((prevSteps) =>
      prevSteps.map((step) => (step.id === updatedStep.id ? updatedStep : step))
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">Your Location</CardTitle>
                        <Badge variant="secondary" className="text-md py-2 px-4 bg-green-100 text-green-800 border-green-300">
                            <Shield className="mr-2 h-5 w-5" />
                            You are in a Safe Zone
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                {mapImage && (
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border-2 border-primary/20">
                        <Image
                            src={mapImage.imageUrl}
                            alt={mapImage.description}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={mapImage.imageHint}
                        />
                        {/* Mock Safe Zone Overlay */}
                        <div className="absolute inset-1/4 rounded-full border-4 border-dashed border-blue-400 bg-blue-400/10" />
                        
                        {/* Mock User Location Pin */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute h-10 w-10 animate-ping rounded-full bg-primary opacity-75"></span>
                                <span className="relative rounded-full h-4 w-4 bg-primary border-2 border-white"></span>
                            </div>
                        </div>

                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Navigation</CardTitle>
                    <CardDescription>Quick actions to help you get around.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" className="w-full h-20 text-xl">
                        <Home className="mr-4 h-8 w-8" />
                        Take Me Home
                    </Button>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Guided Route</CardTitle>
                        <CardDescription>Step-by-step directions to home.</CardDescription>
                    </div>
                    <EditRouteSheet route={navigationSteps} onUpdate={handleUpdate} />
                </CardHeader>
                <CardContent className="space-y-4">
                    {navigationSteps.map((step, index) => (
                        <div key={index}>
                           <div className="flex items-center gap-4 text-lg">
                                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <p className="flex-1">{step.instruction}</p>
                                <Badge variant="outline" className="text-md">{step.distance}</Badge>
                            </div>
                            {index < navigationSteps.length -1 && <Separator className="my-4" />}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
