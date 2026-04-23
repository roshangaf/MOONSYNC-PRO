import { User, Task, Role, Department, AttendanceRecord } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@performaflow.com', role: 'Admin', department: 'Administration', pin: '1111' },
  { id: '2', name: 'Mark Marketer', email: 'mark@performaflow.com', role: 'Marketing', department: 'Marketing', pin: '2222' },
  { id: '3', name: 'Tom Tech', email: 'tom@performaflow.com', role: 'Technician', department: 'Technician', pin: '3333' },
  { id: '4', name: 'Tina Tech', email: 'tina@performaflow.com', role: 'Technician', department: 'Technician', pin: '4444' },
  { id: '5', name: 'Frank Finance', email: 'frank@performaflow.com', role: 'Finance', department: 'Finance', pin: '5555' },
];

export const MOCK_TASKS: Task[] = [];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [];