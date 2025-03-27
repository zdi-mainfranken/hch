
import { useState, useRef, useEffect } from "react";
import { User } from "../types/user";
import { ChevronDown, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSelectorProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onAddNewClick: () => void;
}

const UserSelector = ({ 
  users, 
  selectedUserId, 
  onSelectUser, 
  onAddNewClick 
}: UserSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedUser = selectedUserId 
    ? users.find(user => user.id === selectedUserId)
    : null;
    
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setIsOpen(false);
    setSearchQuery("");
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      <div 
        className={cn(
          "glass flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300",
          isOpen ? "shadow-md" : ""
        )}
        onClick={toggleDropdown}
      >
        {selectedUser ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50">
              <img 
                src={selectedUser.avatar} 
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{selectedUser.name}</span>
              <span className="text-xs text-gray-500">{selectedUser.role}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select a user</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute mt-2 w-full z-50 animate-slide-up origin-top">
          <div className="glass rounded-xl shadow-lg overflow-hidden backdrop-blur-xl">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-72 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                <div className="py-1">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center px-3 py-2 hover:bg-white/60 cursor-pointer transition-colors duration-200",
                        selectedUserId === user.id ? "bg-white/80" : ""
                      )}
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-white/50">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 px-3 text-center text-gray-500 text-sm">
                  No users found
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 p-2">
              <button
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onAddNewClick();
                }}
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
