'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BookHeart,
  Map,
  Settings,
  Bell,
  HeartHandshake,
  Smile,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { useLocale } from '@/hooks/use-locale';

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const menuItems = [
    { href: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/contacts', label: t('nav.contacts'), icon: Users },
    { href: '/journal', label: t('nav.journal'), icon: BookHeart },
    { href: '/mood', label: t('nav.mood'), icon: Smile },
    { href: '/location', label: t('nav.location'), icon: Map },
    { href: '/reminders', label: t('nav.reminders'), icon: Bell },
    { href: '/caregiver', label: t('nav.caregiver'), icon: HeartHandshake },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{
                children: item.label,
                className: 'text-base',
              }}
              className="h-14 justify-start"
            >
              <div>
                <item.icon className="h-6 w-6" />
                <span className="text-lg">{item.label}</span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
