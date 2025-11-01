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
import type { Contact } from '@/lib/types';
import EditContactItem from './edit-contacts-item';
import { Separator } from '../ui/separator';
import { useLocale } from '@/hooks/use-locale';

interface EditContactsSheetProps {
  contacts: Contact[];
  onUpdate: (item: Contact) => void;
}

export function EditContactsSheet({
  contacts,
  onUpdate,
}: EditContactsSheetProps) {
  const { t } = useLocale();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <FilePen className="mr-2" /> {t('contacts.editContacts')}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('contacts.editTitle')}</SheetTitle>
          <SheetDescription>
            {t('contacts.editDescription')}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {contacts.map((contact, index) => (
            <>
              <EditContactItem key={contact.id} contact={contact} onUpdate={onUpdate} />
              {index < contacts.length - 1 && <Separator />}
            </>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button><Save className="mr-2" />{t('contacts.done')}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
