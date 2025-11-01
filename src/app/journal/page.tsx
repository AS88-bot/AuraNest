import JournalForm from '@/components/journal/journal-form';

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Memory Journal
        </h1>
        <p className="text-muted-foreground mt-2">
          Record your thoughts, photos, or voice notes from the day. Then, see a summary of your day.
        </p>
      </header>
      <JournalForm />
    </div>
  );
}
