
import { UserLink } from "../types/user";
import { ExternalLink, FileText, Activity, Calendar } from "lucide-react";
import { SurveyType } from "../types/user";

interface UserLinksProps {
  links: UserLink[];
  name?: string;
  birthDate?: string;
  surveys?: {
    id: string;
    type: SurveyType;
    frequency: string;
    nextDueDate: string;
    completed: boolean;
  }[];
}

const UserLinks = ({ links, surveys = [], name, birthDate }: UserLinksProps) => {
  const getSurveyIcon = (surveyType: SurveyType) => {
    const iconMap = {
      [SurveyType.GENERAL]: FileText,
      [SurveyType.PAIN]: Activity,
      [SurveyType.MOBILITY]: Activity,
      [SurveyType.MENTAL]: Activity,
      [SurveyType.NUTRITION]: Activity,
    };
    
    return iconMap[surveyType] || FileText;
  };
  
  // Format name to first initial + last name (if provided)
  const formatName = (fullName?: string) => {
    if (!fullName) return "";
    const nameParts = fullName.split(" ");
    if (nameParts.length < 2) return fullName;
    
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return `${firstName[0]}. ${lastName}`;
  };
  
  const formattedName = formatName(name);
  
  // Format birthdate to localized date string
  const formattedBirthDate = birthDate ? new Date(birthDate).toLocaleDateString() : "";
  
  return (
    <div className="glass rounded-xl overflow-hidden animate-fade-in">
      <div className="p-6">
        {(formattedName || formattedBirthDate) && (
          <div className="mb-4">
            {formattedName && (
              <h3 className="text-sm font-medium">{formattedName}</h3>
            )}
            {formattedBirthDate && (
              <p className="text-xs text-gray-500">* {formattedBirthDate}</p>
            )}
          </div>
        )}
        
        <h3 className="text-sm font-medium mb-4">Health Surveys</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {surveys && surveys.length > 0 ? (
            surveys.map(survey => {
              const Icon = getSurveyIcon(survey.type);
              const dueDate = new Date(survey.nextDueDate).toLocaleDateString();
              
              return (
                <a 
                  key={survey.id}
                  href={`/surveys/${survey.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-700 ${
                      survey.completed ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{survey.type}</span>
                      <span className="text-xs text-gray-500">Due: {dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs mr-2 px-2 py-0.5 rounded-full ${
                      survey.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {survey.completed ? 'Completed' : 'Pending'}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-800 transition-colors duration-300" />
                  </div>
                </a>
              );
            })
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No scheduled surveys</p>
            </div>
          )}
        </div>
        
        {links && links.length > 0 && (
          <>
            <h3 className="text-sm font-medium mt-6 mb-4">Additional Resources</h3>
            <div className="grid grid-cols-1 gap-3">
              {links.slice(0, 3).map(link => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{link.title}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-800 transition-colors duration-300" />
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLinks;
