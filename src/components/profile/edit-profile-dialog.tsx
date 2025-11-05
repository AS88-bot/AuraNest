'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLocale } from '@/hooks/use-locale';

interface EditProfileDialogProps {
  name: string;
  email: string;
  avatar: string;
  onSave: (name: string, email: string, avatar: string) => void;
}

export function EditProfileDialog({
  name,
  email,
  avatar,
  onSave,
}: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentName, setCurrentName] = useState(name);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocale();

  const handleSave = () => {
    onSave(currentName, currentEmail, currentAvatar);
    setIsOpen(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const contactImages = PlaceHolderImages.filter(p => p.id.startsWith('contact-'));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('userMenu.editProfile')}</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editProfile.title')}</DialogTitle>
          <DialogDescription>
            {t('editProfile.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('editProfile.name')}
            </Label>
            <Input
              id="name"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t('editProfile.email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">{t('editProfile.avatar')}</Label>
            <div className="col-span-3">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={currentAvatar} alt={currentName} />
                            <AvatarFallback>{currentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <Button variant="outline" onClick={triggerFileSelect}><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {contactImages.map(image => (
                            <button key={image.id} onClick={() => setCurrentAvatar(image.imageUrl)} className={`rounded-full overflow-hidden border-2 hover:border-primary focus:border-primary focus:outline-none ${currentAvatar === image.imageUrl ? 'border-primary' : 'border-transparent'}`}>
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={image.imageUrl} alt={image.description} />
                                </Avatar>
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2" />
            {t('editProfile.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
