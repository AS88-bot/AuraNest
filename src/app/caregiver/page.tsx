import CaregiverDashboard from '@/components/caregiver/caregiver-dashboard';

export default function CaregiverPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Caregiver Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          View the location and status of the person you are caring for.
        </p>
      </header>
      <CaregiverDashboard />
    </div>
  );
}
