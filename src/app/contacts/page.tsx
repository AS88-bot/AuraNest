import ContactCard from '@/components/contacts/contact-card';
import { contacts } from '@/lib/data';

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Contacts
        </h1>
        <p className="text-muted-foreground mt-2">
          Your important people. Tap a button to call or video chat.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
