'use client';
import React, { useState } from 'react';
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

export function AppLayout({ children }: { children: React.ReactNode }) {
    const defaultUserImage = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const [userName, setUserName] = useState('Aura User');
    const [userEmail, setUserEmail] = useState('user@auranest.com');
    const [userAvatar, setUserAvatar] = useState(defaultUserImage?.imageUrl || "https://picsum.photos/seed/user/100/100");

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
                <VoiceAssistant />
                <SOSButton />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-12 w-12 rounded-full"
                    >
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={userAvatar} alt={userName} />
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <EditProfileDialog
                      name={userName}
                      email={userEmail}
                      avatar={userAvatar}
                      onSave={(newName, newEmail, newAvatar) => {
                        setUserName(newName);
                        setUserEmail(newEmail);
                        setUserAvatar(newAvatar);
                      }}
                    />
                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
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
