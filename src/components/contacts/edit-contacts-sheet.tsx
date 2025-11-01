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

interface EditContactsSheetProps {
  contacts: Contact[];
  onUpdate: (item: Contact) => void;
}

export function EditContactsSheet({
  contacts,
  onUpdate,
}: EditContactsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <FilePen className="mr-2" /> Edit Contacts
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Contacts</SheetTitle>
          <SheetDescription>
            Make changes to your contacts here. Changes are saved automatically.
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
            <Button><Save className="mr-2" />Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
