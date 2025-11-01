'use client';

import { useState } from 'react';
import ContactCard from '@/components/contacts/contact-card';
import { contacts as initialContacts } from '@/lib/data';
import type { Contact } from '@/lib/types';
import { EditContactsSheet } from '@/components/contacts/edit-contacts-sheet';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const handleUpdate = (updatedContact: Contact) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Contacts
          </h1>
          <p className="text-muted-foreground mt-2">
            Your important people. Tap a button to call or video chat.
          </p>
        </div>
        <EditContactsSheet
          contacts={contacts}
          onUpdate={handleUpdate}
        />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
