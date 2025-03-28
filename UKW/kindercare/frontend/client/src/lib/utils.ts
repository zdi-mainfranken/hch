import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a pseudonymous ID for patients
export function generatePseudonymousId(): string {
  const prefix = "ICUQ";
  const randomPart1 = Math.floor(1000 + Math.random() * 9000);
  const randomPart2 = Array.from({ length: 4 }, () => 
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(
      Math.floor(Math.random() * 31)
    )
  ).join('');
  
  return `${prefix}-${randomPart1}-${randomPart2}`;
}

// Generate a secure passphrase (German words)
export function generatePassphrase(): string {
  // German words for passphrase
  const germanWords = [
    "Apfel", "Baum", "Katze", "Hund", "Haus", "Brot", "Auto",
    "Wasser", "Berg", "Tisch", "Stuhl", "Fenster", "Tür", "Buch",
    "Blume", "Garten", "Sonne", "Mond", "Stern", "Himmel", "Wolke",
    "Regen", "Schnee", "Wind", "Feuer", "Erde", "Fluss", "See",
    "Meer", "Wald", "Wiese", "Straße", "Stadt", "Dorf", "Land"
  ];
  
  // Select 3 random words
  const selectedWords = Array.from({ length: 3 }, () => 
    germanWords[Math.floor(Math.random() * germanWords.length)]
  );
  //return selectedWords.join("-");
  return "Baum-Katze-Wasser";
}

// Format date to locale string
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Calculate days from now
export function calculateDaysFromNow(date: string | Date): number {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Get time description (Today, In X days, etc.)
export function getTimeDescription(date: string | Date): string {
  const days = calculateDaysFromNow(date);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
  if (days < 365) return `In ${Math.floor(days / 30)} months`;
  return `In ${Math.floor(days / 365)} years`;
}
