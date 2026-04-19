import { User, Task, Role, Department } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@performaflow.com', role: 'Admin', department: 'Administration' },
  { id: '2', name: 'Mark Marketer', email: 'mark@performaflow.com', role: 'Marketing', department: 'Marketing' },
  { id: '3', name: 'Tom Tech', email: 'tom@performaflow.com', role: 'Technician', department: 'Technician' },
  { id: '4', name: 'Tina Tech', email: 'tina@performaflow.com', role: 'Technician', department: 'Technician' },
  { id: '5', name: 'Frank Finance', email: 'frank@performaflow.com', role: 'Finance', department: 'Finance' },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Cloud Server Migration',
    description: 'Migrate the main production server to AWS.',
    status: 'Assigned',
    priority: 'High',
    createdBy: '2',
    assignedTo: '3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    timeLogs: [],
  },
  {
    id: 't2',
    title: 'New Client Onboarding',
    description: 'Set up initial infrastructure for the new client XYZ.',
    status: 'Pending',
    priority: 'Medium',
    createdBy: '2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    timeLogs: [],
  },
];