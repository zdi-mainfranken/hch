
import { User, HealthMetric, SurveyType, SurveyFrequency } from "../types/user";

export const users: User[] = [
  {
    id: "1",
    name: "Alex Morgan",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Patient",
    email: "alex.morgan@example.com",
    department: "Cardiology",
    connections: ["2", "3", "5"],
    bio: "45-year-old male with hypertension and family history of heart disease. Recently started medication and lifestyle changes.",
    joinDate: "2023-03-15",
    birthDate: "1978-05-12",
    preExistingConditions: ["Hypertension", "Obesity", "High Cholesterol"],
    diagnoses: ["Essential Hypertension", "Metabolic Syndrome"],
    therapeuticMeasures: ["ACE Inhibitors", "Diet Modification", "Exercise Program"],
    dischargeStatus: "Active",
    surveys: [
      {
        id: "s1-1",
        type: SurveyType.GENERAL,
        frequency: SurveyFrequency.MONTHLY,
        nextDueDate: "2023-07-15",
        completed: false
      },
      {
        id: "s1-2",
        type: SurveyType.MENTAL,
        frequency: SurveyFrequency.THREE_MONTHS,
        nextDueDate: "2023-09-20",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-01-15",
        health: 65,
        vitality: 60,
        pain: 25,
        mobility: 80,
        mentalWellbeing: 70
      },
      {
        date: "2023-02-15",
        health: 68,
        vitality: 65,
        pain: 20,
        mobility: 82,
        mentalWellbeing: 75
      },
      {
        date: "2023-03-15",
        health: 72,
        vitality: 70,
        pain: 15,
        mobility: 85,
        mentalWellbeing: 78
      },
      {
        date: "2023-04-15",
        health: 75,
        vitality: 72,
        pain: 12,
        mobility: 88,
        mentalWellbeing: 80
      },
      {
        date: "2023-05-15",
        health: 78,
        vitality: 75,
        pain: 10,
        mobility: 90,
        mentalWellbeing: 85
      },
      {
        date: "2023-06-15",
        health: 80,
        vitality: 78,
        pain: 8,
        mobility: 92,
        mentalWellbeing: 88
      }
    ],
    links: [
      {
        id: "1-1",
        title: "Exercise Plan",
        url: "https://example.com/exercise-plan",
        icon: "activity"
      },
      {
        id: "1-2",
        title: "Diet Recommendations",
        url: "https://example.com/diet-plan",
        icon: "fileText"
      },
      {
        id: "1-3",
        title: "Medication Schedule",
        url: "https://example.com/medication",
        icon: "calendar"
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Patient",
    email: "sarah.chen@example.com",
    department: "Neurology",
    connections: ["1", "3", "6"],
    bio: "37-year-old female with chronic migraines. Responds well to preventive therapy and stress management techniques.",
    joinDate: "2023-08-10",
    birthDate: "1986-09-22",
    preExistingConditions: ["Migraines", "Anxiety"],
    diagnoses: ["Chronic Migraine", "Tension Headache"],
    therapeuticMeasures: ["Beta Blockers", "Biofeedback Therapy", "Stress Management"],
    dischargeStatus: "Improved",
    surveys: [
      {
        id: "s2-1",
        type: SurveyType.PAIN,
        frequency: SurveyFrequency.WEEKLY,
        nextDueDate: "2023-07-05",
        completed: false
      },
      {
        id: "s2-2",
        type: SurveyType.MENTAL,
        frequency: SurveyFrequency.MONTHLY,
        nextDueDate: "2023-07-20",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-01-10",
        health: 55,
        vitality: 50,
        pain: 75,
        mobility: 85,
        mentalWellbeing: 60
      },
      {
        date: "2023-02-10",
        health: 58,
        vitality: 55,
        pain: 70,
        mobility: 85,
        mentalWellbeing: 65
      },
      {
        date: "2023-03-10",
        health: 62,
        vitality: 60,
        pain: 65,
        mobility: 88,
        mentalWellbeing: 70
      },
      {
        date: "2023-04-10",
        health: 68,
        vitality: 65,
        pain: 55,
        mobility: 90,
        mentalWellbeing: 75
      },
      {
        date: "2023-05-10",
        health: 75,
        vitality: 70,
        pain: 45,
        mobility: 92,
        mentalWellbeing: 80
      },
      {
        date: "2023-06-10",
        health: 80,
        vitality: 75,
        pain: 35,
        mobility: 95,
        mentalWellbeing: 85
      }
    ],
    links: [
      {
        id: "2-1",
        title: "Headache Diary",
        url: "https://example.com/headache-diary",
        icon: "fileText"
      },
      {
        id: "2-2",
        title: "Relaxation Techniques",
        url: "https://example.com/relaxation",
        icon: "activity"
      },
      {
        id: "2-3",
        title: "Support Group",
        url: "https://example.com/support-group",
        icon: "globe"
      }
    ]
  },
  {
    id: "3",
    name: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    role: "Patient",
    email: "james.wilson@example.com",
    department: "Orthopedics",
    connections: ["1", "2", "4", "5"],
    bio: "58-year-old male recovering from knee replacement surgery. Making excellent progress with physical therapy.",
    joinDate: "2023-01-20",
    birthDate: "1965-03-18",
    preExistingConditions: ["Osteoarthritis", "Hypertension"],
    diagnoses: ["Knee Osteoarthritis", "Post-surgical Recovery"],
    therapeuticMeasures: ["Total Knee Replacement", "Physical Therapy", "Pain Management"],
    dischargeStatus: "Improved",
    surveys: [
      {
        id: "s3-1",
        type: SurveyType.MOBILITY,
        frequency: SurveyFrequency.WEEKLY,
        nextDueDate: "2023-07-08",
        completed: false
      },
      {
        id: "s3-2",
        type: SurveyType.PAIN,
        frequency: SurveyFrequency.WEEKLY,
        nextDueDate: "2023-07-08",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-01-05",
        health: 40,
        vitality: 35,
        pain: 85,
        mobility: 25,
        mentalWellbeing: 50
      },
      {
        date: "2023-02-05",
        health: 45,
        vitality: 40,
        pain: 75,
        mobility: 35,
        mentalWellbeing: 55
      },
      {
        date: "2023-03-05",
        health: 55,
        vitality: 50,
        pain: 65,
        mobility: 45,
        mentalWellbeing: 60
      },
      {
        date: "2023-04-05",
        health: 65,
        vitality: 60,
        pain: 55,
        mobility: 55,
        mentalWellbeing: 70
      },
      {
        date: "2023-05-05",
        health: 70,
        vitality: 65,
        pain: 45,
        mobility: 65,
        mentalWellbeing: 75
      },
      {
        date: "2023-06-05",
        health: 75,
        vitality: 70,
        pain: 40,
        mobility: 75,
        mentalWellbeing: 80
      }
    ],
    links: [
      {
        id: "3-1",
        title: "Rehab Exercises",
        url: "https://example.com/rehab-exercises",
        icon: "activity"
      },
      {
        id: "3-2",
        title: "Pain Management",
        url: "https://example.com/pain-management",
        icon: "target"
      },
      {
        id: "3-3",
        title: "Follow-up Schedule",
        url: "https://example.com/follow-up",
        icon: "calendar"
      }
    ]
  },
  {
    id: "4",
    name: "Maria Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    role: "Patient",
    email: "maria.rodriguez@example.com",
    department: "Pulmonology",
    connections: ["3", "5", "7"],
    bio: "62-year-old female with COPD. Stable with inhaler therapy and pulmonary rehabilitation.",
    joinDate: "2023-01-05",
    birthDate: "1961-07-30",
    preExistingConditions: ["Asthma", "Seasonal Allergies", "Former Smoker"],
    diagnoses: ["COPD Stage 2", "Chronic Bronchitis"],
    therapeuticMeasures: ["Bronchodilators", "Inhaled Corticosteroids", "Pulmonary Rehabilitation"],
    dischargeStatus: "Stable",
    surveys: [
      {
        id: "s4-1",
        type: SurveyType.GENERAL,
        frequency: SurveyFrequency.MONTHLY,
        nextDueDate: "2023-07-25",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-01-20",
        health: 50,
        vitality: 45,
        pain: 30,
        mobility: 60,
        mentalWellbeing: 65
      },
      {
        date: "2023-02-20",
        health: 53,
        vitality: 48,
        pain: 28,
        mobility: 62,
        mentalWellbeing: 68
      },
      {
        date: "2023-03-20",
        health: 55,
        vitality: 50,
        pain: 25,
        mobility: 65,
        mentalWellbeing: 70
      },
      {
        date: "2023-04-20",
        health: 58,
        vitality: 52,
        pain: 22,
        mobility: 68,
        mentalWellbeing: 72
      },
      {
        date: "2023-05-20",
        health: 60,
        vitality: 55,
        pain: 20,
        mobility: 70,
        mentalWellbeing: 75
      },
      {
        date: "2023-06-20",
        health: 62,
        vitality: 58,
        pain: 18,
        mobility: 72,
        mentalWellbeing: 78
      }
    ],
    links: [
      {
        id: "4-1",
        title: "Breathing Exercises",
        url: "https://example.com/breathing-exercises",
        icon: "activity"
      },
      {
        id: "4-2",
        title: "Medication Guide",
        url: "https://example.com/medication-guide",
        icon: "fileText"
      },
      {
        id: "4-3",
        title: "Air Quality Tracker",
        url: "https://example.com/air-quality",
        icon: "barChart"
      }
    ]
  },
  {
    id: "5",
    name: "David Kim",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    role: "Patient",
    email: "david.kim@example.com",
    department: "Endocrinology",
    connections: ["1", "3", "4", "6"],
    bio: "42-year-old male with Type 2 Diabetes. Well-controlled with diet, exercise, and oral medication.",
    joinDate: "2023-11-15",
    birthDate: "1981-12-03",
    preExistingConditions: ["Family History of Diabetes", "Overweight"],
    diagnoses: ["Type 2 Diabetes", "Hyperlipidemia"],
    therapeuticMeasures: ["Metformin", "Lifestyle Modification", "Diet Control"],
    dischargeStatus: "Active",
    surveys: [
      {
        id: "s5-1",
        type: SurveyType.GENERAL,
        frequency: SurveyFrequency.THREE_MONTHS,
        nextDueDate: "2023-08-15",
        completed: false
      },
      {
        id: "s5-2",
        type: SurveyType.NUTRITION,
        frequency: SurveyFrequency.MONTHLY,
        nextDueDate: "2023-07-15",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-01-25",
        health: 60,
        vitality: 55,
        pain: 15,
        mobility: 85,
        mentalWellbeing: 75
      },
      {
        date: "2023-02-25",
        health: 63,
        vitality: 58,
        pain: 15,
        mobility: 85,
        mentalWellbeing: 78
      },
      {
        date: "2023-03-25",
        health: 68,
        vitality: 62,
        pain: 15,
        mobility: 85,
        mentalWellbeing: 80
      },
      {
        date: "2023-04-25",
        health: 72,
        vitality: 68,
        pain: 12,
        mobility: 88,
        mentalWellbeing: 82
      },
      {
        date: "2023-05-25",
        health: 75,
        vitality: 72,
        pain: 10,
        mobility: 90,
        mentalWellbeing: 85
      },
      {
        date: "2023-06-25",
        health: 78,
        vitality: 75,
        pain: 10,
        mobility: 90,
        mentalWellbeing: 88
      }
    ],
    links: [
      {
        id: "5-1",
        title: "Glucose Monitoring",
        url: "https://example.com/glucose-monitoring",
        icon: "barChart"
      },
      {
        id: "5-2",
        title: "Meal Planning",
        url: "https://example.com/meal-planning",
        icon: "fileText"
      },
      {
        id: "5-3",
        title: "Diabetes Support",
        url: "https://example.com/diabetes-support",
        icon: "globe"
      }
    ]
  },
  {
    id: "6",
    name: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    role: "Patient",
    email: "emily.johnson@example.com",
    department: "Psychiatry",
    connections: ["2", "5", "7"],
    bio: "34-year-old female with generalized anxiety disorder and depression. Responding well to therapy and medication.",
    joinDate: "2023-01-20",
    birthDate: "1989-02-15",
    preExistingConditions: ["Family History of Depression"],
    diagnoses: ["Generalized Anxiety Disorder", "Major Depressive Disorder"],
    therapeuticMeasures: ["SSRIs", "Cognitive Behavioral Therapy", "Mindfulness Training"],
    dischargeStatus: "Improved",
    surveys: [
      {
        id: "s6-1",
        type: SurveyType.MENTAL,
        frequency: SurveyFrequency.WEEKLY,
        nextDueDate: "2023-07-07",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-01-30",
        health: 45,
        vitality: 40,
        pain: 20,
        mobility: 90,
        mentalWellbeing: 35
      },
      {
        date: "2023-02-28",
        health: 48,
        vitality: 42,
        pain: 20,
        mobility: 90,
        mentalWellbeing: 40
      },
      {
        date: "2023-03-30",
        health: 52,
        vitality: 48,
        pain: 18,
        mobility: 92,
        mentalWellbeing: 45
      },
      {
        date: "2023-04-30",
        health: 58,
        vitality: 53,
        pain: 15,
        mobility: 95,
        mentalWellbeing: 55
      },
      {
        date: "2023-05-30",
        health: 65,
        vitality: 60,
        pain: 15,
        mobility: 95,
        mentalWellbeing: 65
      },
      {
        date: "2023-06-30",
        health: 72,
        vitality: 68,
        pain: 12,
        mobility: 95,
        mentalWellbeing: 75
      }
    ],
    links: [
      {
        id: "6-1",
        title: "Mood Tracker",
        url: "https://example.com/mood-tracker",
        icon: "barChart"
      },
      {
        id: "6-2",
        title: "Relaxation Techniques",
        url: "https://example.com/relaxation-techniques",
        icon: "activity"
      },
      {
        id: "6-3",
        title: "Support Resources",
        url: "https://example.com/mental-health-support",
        icon: "globe"
      }
    ]
  },
  {
    id: "7",
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    role: "Patient",
    email: "michael.brown@example.com",
    department: "Gastroenterology",
    connections: ["4", "6"],
    bio: "53-year-old male with Crohn's disease. In remission with biological therapy.",
    joinDate: "2022-09-30",
    birthDate: "1970-11-08",
    preExistingConditions: ["Irritable Bowel Syndrome", "Lactose Intolerance"],
    diagnoses: ["Crohn's Disease", "Iron Deficiency Anemia"],
    therapeuticMeasures: ["Biological Therapy", "Immunomodulators", "Dietary Management"],
    dischargeStatus: "Remission",
    surveys: [
      {
        id: "s7-1",
        type: SurveyType.GENERAL,
        frequency: SurveyFrequency.MONTHLY,
        nextDueDate: "2023-04-18",
        completed: false
      },
      {
        id: "s7-2",
        type: SurveyType.NUTRITION,
        frequency: SurveyFrequency.MONTHLY,
        nextDueDate: "2023-05-18",
        completed: false
      }
    ],
    healthMetrics: [
      {
        date: "2023-05-12",
        health: 40,
        vitality: 35,
        pain: 65,
        mobility: 75,
        mentalWellbeing: 50
      },
      {
        date: "2023-06-12",
        health: 45,
        vitality: 40,
        pain: 60,
        mobility: 75,
        mentalWellbeing: 55
      },
      {
        date: "2023-07-12",
        health: 55,
        vitality: 50,
        pain: 50,
        mobility: 80,
        mentalWellbeing: 60
      },
      {
        date: "2023-08-12",
        health: 65,
        vitality: 60,
        pain: 40,
        mobility: 85,
        mentalWellbeing: 65
      },
      {
        date: "2023-09-12",
        health: 72,
        vitality: 68,
        pain: 30,
        mobility: 88,
        mentalWellbeing: 70
      },
      {
        date: "2023-10-12",
        health: 78,
        vitality: 75,
        pain: 25,
        mobility: 90,
        mentalWellbeing: 75
      }
    ],
    links: [
      {
        id: "7-1",
        title: "Symptom Tracker",
        url: "https://example.com/symptom-tracker",
        icon: "barChart"
      },
      {
        id: "7-2",
        title: "Nutrition Guide",
        url: "https://example.com/nutrition-guide",
        icon: "fileText"
      },
      {
        id: "7-3",
        title: "Medication Schedule",
        url: "https://example.com/medication-schedule",
        icon: "calendar"
      }
    ]
  }
];

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUserConnections = (userId: string): User[] => {
  const user = getUserById(userId);
  if (!user) return [];
  
  return user.connections
    .map(id => getUserById(id))
    .filter((user): user is User => user !== undefined);
};

export const getGraphData = (userId: string) => {
  const user = getUserById(userId);
  if (!user) return { nodes: [], links: [] };
  
  // Colors for different departments
  const departmentColors: Record<string, string> = {
    "Cardiology": "#3B82F6",
    "Neurology": "#EC4899",
    "Orthopedics": "#F97316",
    "Pulmonology": "#10B981",
    "Endocrinology": "#8B5CF6",
    "Psychiatry": "#F59E0B",
    "Gastroenterology": "#6366F1"
  };
  
  // Create nodes
  const nodes = [
    {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      color: departmentColors[user.department] || "#6B7280"
    },
    ...user.connections.map(connId => {
      const conn = getUserById(connId);
      return {
        id: conn?.id || connId,
        name: conn?.name || "Unknown",
        avatar: conn?.avatar || "",
        role: conn?.role || "Unknown",
        color: conn ? (departmentColors[conn.department] || "#6B7280") : "#6B7280"
      };
    })
  ];
  
  // Create links
  const links = user.connections.map(connId => ({
    source: user.id,
    target: connId
  }));
  
  return { nodes, links };
};

export const getPatientHealthMetrics = (userId: string): HealthMetric[] => {
  const user = getUserById(userId);
  return user?.healthMetrics || [];
};
