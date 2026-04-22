export type Role = 'Admin' | 'Marketing' | 'Technician' | 'Finance';
export type Department = 'Administration' | 'Marketing' | 'Technician' | 'Finance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: Department;
  avatar?: string;
  pin: string; // Added for identity verification
}

export type TaskStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'On Hold';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  contactName?: string;
  contactNumber?: string;
  address?: string;
  detailedDescription?: string;
  subTasks?: string[];
  steps?: string[];
  status: TaskStatus;
  priority: Priority;
  createdBy: string; // User ID
  assignedTo?: string; // User ID
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  timeLogs: TimeLog[];
}

export interface TimeLog {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // In minutes
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent';
  location?: string;
  source?: 'Manual' | 'Hardware' | 'Mobile';
}

export type BillType = 'VAT' | 'Estimate';

export interface BillItem {
  id: string;
  particular: string;
  amount: number;
  quantity: number;
}

export interface Bill {
  id: string;
  type: BillType;
  clientName: string;
  address?: string;
  items: BillItem[];
  totalAmount: number;
  createdAt: string;
  currency: 'NRS';
  status?: 'Paid' | 'Pending' | 'Overdue' | 'Void';
}

export interface PerformanceStats {
  userId: string;
  tasksCompleted: number;
  averageTimePerTask: number; // In minutes
  totalTimeSpent: number; // In minutes
}
