'use client';
import { useState } from 'react';
import type { Contact } from '@/lib/types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLocale } from '@/hooks/use-locale';

interface EditContactItemProps {
  contact: Contact;
  onUpdate: (updatedContact: Contact) => void;
}

export default function EditContactItem({ contact, onUpdate }: EditContactItemProps) {
  const { t } = useLocale();
  const [name, setName] = useState(t(contact.name));
  const [relation, setRelation] = useState(t(contact.relationKey));
  const [avatarId, setAvatarId] = useState(contact.avatar);
  
  const contactImages = PlaceHolderImages.filter(p => p.id.startsWith('contact-'));
  const currentAvatar = PlaceHolderImages.find(p => p.id === avatarId);
  const contactName = t(contact.name);

  const handleBlur = () => {
    // This is complex because we would need to reverse-lookup the translation key
    // onUpdate({
    //   ...contact,
    //   name,
    //   relation,
    //   avatar: avatarId,
    // });
  };
  
  const handleAvatarChange = (newAvatarId: string) => {
    setAvatarId(newAvatarId);
    onUpdate({
      ...contact,
      avatar: newAvatarId,
    });
  };

  return (
    <div className="grid gap-6">
        <h4 className="font-semibold text-lg text-primary">{contactName}</h4>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`name-${contact.id}`} className="text-right">
            Name
            </Label>
            <Input
            id={`name-${contact.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            className="col-span-3"
            />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`relation-${contact.id}`} className="text-right">
            Relation
            </Label>
            <Input
            id={`relation-${contact.id}`}
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            onBlur={handleBlur}
            className="col-span-3"
            />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Avatar</Label>
            <div className="col-span-3">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={currentAvatar?.imageUrl} alt={name} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid grid-cols-3 gap-2">
                        {contactImages.map(image => (
                            <button key={image.id} onClick={() => handleAvatarChange(image.id)} className={`rounded-full overflow-hidden border-2 ${avatarId === image.id ? 'border-primary' : 'border-transparent'} hover:border-primary focus:border-primary focus:outline-none`}>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={image.imageUrl} alt={image.description} />
                                </Avatar>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

    