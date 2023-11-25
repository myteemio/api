// Activity model goes here

export type Activity = {
  id: string;
  url: string;
  name: string;
  description: string;
  image: string;
  pris: number;
  persons: number;
  category: [string];
  address: {
    address1: string;
    address2: string;
    zipcode: string;
    city: string;
    country: string;
  };
  referralLink: string; // Referral link to where they can book the activity
  location: {
    // For easier distance calculation
    lat: number;
    long: number;
  };
  estimatedHours: 2; // The amount of hours we estimate the activity to take up
};
