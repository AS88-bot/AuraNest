import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contact } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Phone, Video } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLocale } from '@/hooks/use-locale';

interface ContactCardProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactCardProps) {
  const image = PlaceHolderImages.find(p => p.id === contact.avatar);
  const { t } = useLocale();
  const contactName = t(contact.name);

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="p-0">
        <Avatar className="w-32 h-32 border-4 border-white shadow-md">
            {image && (
              <AvatarImage src={image.imageUrl} alt={contactName} data-ai-hint={image.imageHint} />
            )}
          <AvatarFallback className="text-4xl">{contactName.charAt(0)}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        <CardTitle className="text-2xl font-bold">{contactName}</CardTitle>
        <p className="text-lg text-muted-foreground">{t(contact.relationKey)}</p>
      </CardContent>
      <CardFooter className="mt-6 flex gap-4 p-0">
        <Button size="lg" className="h-16 w-16 rounded-full">
            <Phone className="h-8 w-8" />
            <span className="sr-only">Call {contactName}</span>
        </Button>
        <Button size="lg" variant="secondary" className="h-16 w-16 rounded-full">
            <Video className="h-8 w-8" />
            <span className="sr-only">Video call {contactName}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

    