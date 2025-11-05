import type { PlannerItem, Contact } from './types';

export const dailySchedule: Omit<PlannerItem, 'onUpdate'>[] = [
  {
    id: '1',
    time: '08:00 AM',
    titleKey: 'dashboard.schedule.item1.title',
    category: 'medication',
    descriptionKey: 'dashboard.schedule.item1.description',
    icon: 'Pill',
    image: 'medication-1',
    isCompleted: true,
  },
  {
    id: '2',
    time: '08:30 AM',
    titleKey: 'dashboard.schedule.item2.title',
    category: 'meal',
    descriptionKey: 'dashboard.schedule.item2.description',
    icon: 'Utensils',
    isCompleted: false,
  },
  {
    id: '3',
    time: '10:00 AM',
    titleKey: 'dashboard.schedule.item3.title',
    category: 'appointment',
    descriptionKey: 'dashboard.schedule.item3.description',
    icon: 'Calendar',
    isCompleted: false,
  },
  {
    id: '4',
    time: '01:00 PM',
    titleKey: 'dashboard.schedule.item4.title',
    category: 'meal',
    descriptionKey: 'dashboard.schedule.item4.description',
    icon: 'Utensils',
    isCompleted: false,
  },
    {
    id: '5',
    time: '03:00 PM',
    titleKey: 'dashboard.schedule.item5.title',
    category: 'activity',
    descriptionKey: 'dashboard.schedule.item5.description',
    icon: 'Smile',
    isCompleted: false,
  },
  {
    id: '6',
    time: '06:00 PM',
    titleKey: 'dashboard.schedule.item6.title',
    category: 'medication',
    descriptionKey: 'dashboard.schedule.item6.description',
    icon: 'Pill',
    image: 'medication-2',
    isCompleted: false,
  },
  {
    id: '7',
    time: '07:00 PM',
    titleKey: 'dashboard.schedule.item7.title',
    category: 'meal',
    descriptionKey: 'dashboard.schedule.item7.description',
    icon: 'Utensils',
    isCompleted: false,
  },
];

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'contacts.name.sarah',
    relationKey: 'contacts.relation.daughter',
    avatar: 'contact-1',
    phone: '555-0101',
  },
  {
    id: '2',
    name: 'contacts.name.drEvans',
    relationKey: 'contacts.relation.doctor',
    avatar: 'contact-2',
    phone: '555-0102',
  },
    {
    id: '3',
    name: 'contacts.name.alex',
    relationKey: 'contacts.relation.grandchild',
    avatar: 'contact-3',
    phone: '555-0103',
  },
  {
    id: '4',
    name: 'contacts.name.maria',
    relationKey: 'contacts.relation.caregiver',
    avatar: 'contact-4',
    phone: '555-0104',
  },
  {
    id: '5',
    name: 'contacts.name.leo',
    relationKey: 'contacts.relation.neighbor',
    avatar: 'contact-5',
    phone: '555-0105',
  },
];

    