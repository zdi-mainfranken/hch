
import { User, SurveyFrequency } from "../types/user";
import { Calendar, Clock, Activity, User as UserIcon } from "lucide-react";

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const getNextSurvey = () => {
    if (!user.surveys || user.surveys.length === 0) {
      return "No surveys scheduled";
    }
    
    const upcomingSurveys = user.surveys
      .filter(survey => !survey.completed)
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
      
    if (upcomingSurveys.length === 0) {
      return "All surveys completed";
    }
    
    const nextSurvey = upcomingSurveys[0];
    const dueDate = new Date(nextSurvey.nextDueDate);
    const formattedDate = dueDate.toLocaleDateString();
    
    return `${nextSurvey.type} - ${formattedDate}`;
  };
  
  // Generate anonymized ID if not provided
  const getAnonymizedId = () => {
    if (user.anonymizedId) {
      return user.anonymizedId;
    }
    
    const nameParts = user.name.split(' ');
    const lastName = nameParts[nameParts.length - 1];
    const firstLetter = lastName.charAt(0);
    const formattedBirth = user.birthDate.replace(/-/g, '');
    
    return `${firstLetter}${formattedBirth}`;
  };
  
  return (
    <div className="glass rounded-xl overflow-hidden animate-fade-in">
      <div className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-white">
            <UserIcon className="w-10 h-10 text-primary/60" />
          </div>
          
          <h2 className="text-xl font-semibold">ID: {getAnonymizedId()}</h2>
          <p className="text-sm text-gray-500">
            {user.role} • {user.department}
          </p>
          
          {user.birthDate && (
            <div className="mt-1 text-sm text-gray-500">
              {user.birthDate} ({calculateAge(user.birthDate)} years)
            </div>
          )}
          
          <div className="mt-3 flex space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              user.dischargeStatus === "Active" ? "bg-blue-100 text-blue-700" :
              user.dischargeStatus === "Recovered" ? "bg-green-100 text-green-700" :
              user.dischargeStatus === "Improved" ? "bg-teal-100 text-teal-700" :
              user.dischargeStatus === "Unchanged" ? "bg-yellow-100 text-yellow-700" :
              user.dischargeStatus === "Deteriorated" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {user.dischargeStatus || "Status Unknown"}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {user.bio && (
            <div className="text-sm text-gray-600">
              {user.bio}
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Patient since {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Next Survey: {getNextSurvey()}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-gray-400" />
              <span>Survey Frequency: {user.surveys?.[0]?.frequency || "Not set"}</span>
            </div>
          </div>
          
          {/* Display diagnoses */}
          {user.diagnoses && user.diagnoses.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Diagnoses</h3>
              <div className="text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {user.diagnoses.map((diagnosis, index) => (
                    <li key={index} className="text-gray-600">{diagnosis}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Display therapeutic measures */}
          {user.therapeuticMeasures && user.therapeuticMeasures.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Therapeutic Measures</h3>
              <div className="text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {user.therapeuticMeasures.map((measure, index) => (
                    <li key={index} className="text-gray-600">{measure}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Display pre-existing conditions */}
          {user.preExistingConditions && user.preExistingConditions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Pre-existing Conditions</h3>
              <div className="text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {user.preExistingConditions.map((condition, index) => (
                    <li key={index} className="text-gray-600">{condition}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
