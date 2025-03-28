import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  CalendarClock, 
  ClipboardList, 
  UserPlus 
} from 'lucide-react';

interface DoctorDashboardProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

const DoctorDashboard = ({ user }: DoctorDashboardProps) => {
  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Please log in to access the dashboard
          </h1>
          <p className="mt-4">
            <Link href="/">
              <Button>Go to Login</Button>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Questionnaires</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground mt-1">+4 added this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Due in the next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="font-medium">Patient ICUQ-7291-DFHT completed HADS questionnaire</p>
                  <p className="text-sm text-slate-500">Today, 10:32 AM</p>
                </div>
                <div className="border-b pb-3">
                  <p className="font-medium">New patient onboarded: ICUQ-5429-HJKL</p>
                  <p className="text-sm text-slate-500">Yesterday, 2:45 PM</p>
                </div>
                <div className="border-b pb-3">
                  <p className="font-medium">Patient ICUQ-2354-MNDE completed MoCA questionnaire</p>
                  <p className="text-sm text-slate-500">April 10, 2023, 9:12 AM</p>
                </div>
                <div>
                  <p className="font-medium">New questionnaire added: SF-36 (Health domain)</p>
                  <p className="text-sm text-slate-500">April 8, 2023, 11:05 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/patient-onboarding">
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Patient
                  </Button>
                </Link>
                <Link href="/data-review">
                  <Button className="w-full justify-start" variant="outline">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Review Data
                  </Button>
                </Link>
                <Link href="/aggregate-data">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
