
import { useState } from "react";
import { users, getUserById, getPatientHealthMetrics } from "../utils/mockData";
import UserSelector from "../components/UserSelector";
import UserGraph from "../components/UserGraph";
import UserProfile from "../components/UserProfile";
import UserLinks from "../components/UserLinks";
import AddUserModal from "../components/AddUserModal";
import AggregatedStats from "../components/AggregatedStats";
import { User } from "../types/user";
import { Users, UserPlus, BarChart } from "lucide-react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Index = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<User[]>(users);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"individual" | "aggregated">("individual");
  
  const selectedUser = selectedUserId ? getUserById(selectedUserId) : null;
  const healthMetrics = selectedUserId ? getPatientHealthMetrics(selectedUserId) : [];
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    if (viewMode === "aggregated") {
      setViewMode("individual");
    }
  };
  
  const handleAddUser = (userData: Omit<User, "id" | "connections">) => {
    const newId = String(usersList.length + 1);
    const newUser: User = {
      ...userData,
      id: newId,
      connections: []
    };
    
    setUsersList([...usersList, newUser]);
    toast.success("New patient added successfully!");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-black/5 text-xs font-medium mb-3">
            <Users className="w-3 h-3 mr-1" />
            Patient Management System
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Patient Overview
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Track patient health and vitality metrics over time, manage medical histories, and schedule follow-up surveys.
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="mb-6 flex justify-center">
          <ToggleGroup 
            type="single" 
            value={viewMode}
            onValueChange={(value) => {
              if (value) setViewMode(value as "individual" | "aggregated");
            }}
            className="border rounded-lg p-1"
          >
            <ToggleGroupItem value="individual" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Individual Patients</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="aggregated" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span>Aggregated Statistics</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {viewMode === "individual" ? (
          <>
            {/* User Selection Bar */}
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <UserSelector 
                users={usersList}
                selectedUserId={selectedUserId}
                onSelectUser={handleSelectUser}
                onAddNewClick={() => setIsAddModalOpen(true)}
              />
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="neo flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Patient</span>
              </button>
            </div>
            
            {selectedUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Health Trends Graph */}
                <div className="lg:col-span-2">
                  <UserGraph 
                    data={healthMetrics}
                  />
                </div>
                
                {/* Right Column - User Details */}
                <div className="space-y-6">
                  <UserProfile user={selectedUser} />
                  <UserLinks 
                    links={selectedUser.links} 
                    surveys={selectedUser.surveys}
                    name={selectedUser.name}
                    birthDate={selectedUser.birthDate}
                  />
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-10 text-center animate-fade-in">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Please select a patient from the dropdown above to view their health trends, medical history and scheduled surveys.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Patient
                </button>
              </div>
            )}
          </>
        ) : (
          <AggregatedStats />
        )}
      </div>
      
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
        users={usersList}
      />
    </div>
  );
};

export default Index;
