'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateMemoryJournalSummary } from '@/ai/flows/memory-journal-summary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2, Mic, Image as ImageIcon } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';

const formSchema = z.object({
  journalEntry: z.string().min(10, {
    message: 'Please write a little more about your day.',
  }),
});

export default function JournalForm() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      journalEntry: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await generateMemoryJournalSummary({
        journalEntries: values.journalEntry,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      // Here you would typically show an error to the user
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('journal.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="journalEntry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Journal Entry</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('journal.formPlaceholder')}
                        className="min-h-[250px] text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex gap-4">
                    <Button type="button" size="lg" variant="outline"><ImageIcon className="mr-2" /> {t('journal.addPhoto')}</Button>
                    <Button type="button" size="lg" variant="outline"><Mic className="mr-2" /> {t('journal.recordNote')}</Button>
                 </div>
                 <Button type="submit" size="lg" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      {t('journal.generating')}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-6 w-6" />
                      {t('journal.generateSummary')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('journal.summaryTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-foreground space-y-4 min-h-[250px]">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {summary && !isLoading && (
             <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
          )}
           {!summary && !isLoading && (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t('journal.summaryPlaceholder')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
