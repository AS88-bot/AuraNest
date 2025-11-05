'use client';
import React, { useState, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { BrainCircuit, LogOut, User } from 'lucide-react';
import { SOSButton } from '../sos-button';
import { VoiceAssistant } from '../voice-assistant';
import { EditProfileDialog } from '../profile/edit-profile-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirebase } from '@/firebase';
import { useLocale } from '@/hooks/use-locale';
import LoginPage from '@/app/login/page';
import { updateProfile } from 'firebase/auth';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const defaultUserImage = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const [userName, setUserName] = useState('Aura User');
    const [userEmail, setUserEmail] = useState('user@auranest.com');
    const [userAvatar, setUserAvatar] = useState(defaultUserImage?.imageUrl || "https://picsum.photos/seed/user/100/100");
    const [isClient, setIsClient] = useState(false);
    const { user, isUserLoading } = useUser();
    const { auth } = useFirebase();
    const { t } = useLocale();

    useEffect(() => {
      setIsClient(true);
    }, []);

    const handleProfileSave = async (newName: string, newEmail: string, newAvatar: string) => {
      if (user) {
        await updateProfile(user, {
          displayName: newName,
          photoURL: newAvatar,
        });
        // Note: updating email is a separate, more complex flow.
        setUserName(newName);
        setUserAvatar(newAvatar);
      }
    };

    // If user state is still loading, show a loading screen or skeleton
    if (isUserLoading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <BrainCircuit className="size-16 animate-pulse text-primary" />
        </div>
      );
    }
    
    // If no user is logged in, show the login page
    if (!user) {
      return <LoginPage />;
    }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="items-center justify-center text-center">
            <BrainCircuit className="size-8 text-primary group-data-[state=collapsed]:hidden" />
            <h2 className="text-xl font-bold text-foreground group-data-[state=collapsed]:hidden">
                AuraNest
            </h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="items-center justify-center">
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
            <div className="md:hidden">
              {/* Mobile SOS button if needed, or trigger for sidebar */}
            </div>
             <div className="flex-1" />
            <div className="flex items-center gap-4">
                {isClient && <VoiceAssistant />}
                <SOSButton />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-12 w-12 rounded-full"
                    >
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.photoURL || userAvatar} alt={user.displayName || userName} />
                            <AvatarFallback>{(user.displayName || userName).charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.isAnonymous ? t('userMenu.anonymousUser') : user.email}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!user.isAnonymous && (
                        <EditProfileDialog
                        name={user.displayName || userName}
                        email={user.email || userEmail}
                        avatar={user.photoURL || userAvatar}
                        onSave={handleProfileSave}
                        />
                    )}
                    <DropdownMenuItem onClick={() => auth.signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('userMenu.logout')}</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
