import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DoctorLogin from "@/pages/DoctorLogin";
import PatientOnboarding from "@/pages/PatientOnboarding";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientLogin from "@/pages/PatientLogin";
import DataReview from "@/pages/DataReview";
import AggregateData from "@/pages/AggregateData";
import { useState } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null>(null);

  const [currentPatient, setCurrentPatient] = useState<{
    id: number;
    pseudonymousId: string;
  } | null>(null);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
  };

  const handlePatientLogin = (patient: any) => {
    setCurrentPatient(patient);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPatient(null);
  };

  return (
    <>
      <Layout 
        currentUser={currentUser} 
        onLogout={handleLogout}
      >
        <Switch>
          <Route path="/" component={() => 
            currentUser ? 
              <DoctorDashboard user={currentUser} /> : 
              <DoctorLogin onLogin={handleLogin} />
          } />
          <Route path="/doctor" component={() => 
            currentUser ? 
              <DoctorDashboard user={currentUser} /> : 
              <DoctorLogin onLogin={handleLogin} />
          } />
          <Route path="/patient-onboarding" component={() => 
            currentUser ? 
              <PatientOnboarding user={currentUser} /> : 
              <DoctorLogin onLogin={handleLogin} />
          } />
          <Route path="/patient-dashboard" component={() => 
            currentPatient ? 
              <PatientDashboard patient={currentPatient} /> : 
              <PatientLogin onLogin={handlePatientLogin} />
          } />
          <Route path="/patient-login" component={() => 
            <PatientLogin onLogin={handlePatientLogin} />
          } />
          <Route path="/data-review" component={() => 
            currentUser ? 
              <DataReview user={currentUser} /> : 
              <DoctorLogin onLogin={handleLogin} />
          } />
          <Route path="/aggregate-data" component={() => 
            currentUser ? 
              <AggregateData user={currentUser} /> : 
              <DoctorLogin onLogin={handleLogin} />
          } />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
