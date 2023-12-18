export const TESTmockUsers = [
  {
    name: 'Alice Smith',
    email: 'test@test.com',
    phone: '+12345678',
    type: 'admin',
  },
  { name: 'Bob Johnson', type: 'user' },
  { name: 'Charlie Brown', email: 'charlie@example.com', type: 'user' },
  { name: 'Diana Prince', phone: '+447891234', type: 'user' },
  {
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    phone: '+614567890',
    type: 'admin',
  },
  { name: 'Fiona Gallagher', type: 'user' },
  { name: 'George Lucas', email: 'george@example.com',phone: '+1313819383', type: 'user' },
  { name: 'Hannah Abbott', phone: '+812345678', type: 'user' },
  { name: 'Ian Malcolm', email: 'ian@example.com', type: 'user' },
  {
    name: 'Jenna Coleman',
    email: 'jenna@example.com',
    phone: '+331234567',
    type: 'admin',
  },
];

export const TESTmockActivities = [
  {
    name: 'Beach Yoga Retreat',
    url: 'beach-yoga-retreat',
    description: 'Relax and rejuvenate with a yoga session on the beach.',
    image: 'beach_yoga.jpg',
    price: 25,
    persons: 10,
    category: ['Wellness', 'Outdoor'],
    address: {
      address1: '789 Ocean Drive',
      zipcode: '33139',
      city: 'Miami Beach',
      country: 'USA',
    },
    referralLink: 'https://beachyogaretreat.com',
    location: {
      lat: 25.7907,
      long: -80.13,
    },
    estimatedHours: 2,
  },
  {
    name: 'Mountain Hiking Adventure',
    url: 'mountain-hiking-adventure',
    description: 'Challenge yourself with a hike through scenic mountain trails.',
    image: 'mountain_hiking.jpg',
    price: 60,
    persons: 8,
    category: ['Adventure', 'Outdoor'],
    address: {
      address1: '321 Mountain Path',
      zipcode: '80302',
      city: 'Boulder',
      country: 'USA',
    },
    referralLink: 'https://mountainhikingadventure.com',
    location: {
      lat: 40.0149,
      long: -105.2705,
    },
    estimatedHours: 6,
  },
  {
    name: 'Gourmet Cooking Class',
    url: 'gourmet-cooking-class',
    description: 'Learn to cook gourmet dishes with a professional chef.',
    image: 'cooking_class.jpg',
    price: 100,
    persons: 6,
    category: ['Culinary', 'Educational'],
    address: {
      address1: '654 Culinary Road',
      zipcode: '94102',
      city: 'San Francisco',
      country: 'USA',
    },
    referralLink: 'https://gourmetcookingclass.com',
    location: {
      lat: 37.7749,
      long: -122.4194,
    },
    estimatedHours: 4,
  },
  {
    name: 'Urban Graffiti Art Tour',
    url: 'urban-graffiti-art-tour',
    description: "Discover the city's vibrant street art scene on this guided tour.",
    image: 'graffiti_tour.jpg',
    price: 20,
    persons: 15,
    category: ['Urban', 'Cultural'],
    address: {
      address1: '987 Street Art Way',
      zipcode: '90013',
      city: 'Los Angeles',
      country: 'USA',
    },
    referralLink: 'https://urbangraffitiarttour.com',
    location: {
      lat: 34.0522,
      long: -118.2437,
    },
    estimatedHours: 2,
  },
  {
    name: 'Underwater Diving Expedition',
    url: 'underwater-diving-expedition',
    description: 'Explore the underwater world with a certified diving instructor.',
    image: 'diving_expedition.jpg',
    price: 120,
    persons: 4,
    category: ['Adventure', 'Outdoor'],
    address: {
      address1: '1234 Coral Reef Lane',
      zipcode: '96740',
      city: 'Kailua-Kona',
      country: 'USA',
    },
    referralLink: 'https://underwaterdivingexpedition.com',
    location: {
      lat: 19.6399,
      long: -155.9969,
    },
    estimatedHours: 5,
  },
];

export const TESTmockTeemios = [
  {
    status: 'finalized',
    activities: [
      {
        activity: '656f53446b9f52b36fbde08a',
        timeslot: {
          from: '2023-12-12T12:30:00.000Z',
          to: '2023-12-12T14:30:00.000Z',
        },
        votes: [{ id: 'user1', name: 'Alice' }],
      },
    ],
    organizer: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    },
    eventinfo: {
      name: 'Annual Company Retreat',
      description: 'A fun retreat for all employees',
      logo: 'company_logo.png',
      image: 'company_image.png',
      url: 'annual-company-retreat',
    },
    dates: [
      {
        date: '2023-12-12',
        votes: ['user1', 'user2'],
      },
    ],
  },
  {
    status: 'locked',
    activities: [
      {
        activity: '656f53446b9f52b36fbde08d',
        timeslot: {
          from: '2023-12-14T12:30:00.000Z',
          to: '2023-12-14T14:30:00.000Z',
        },
        votes: [{ id: 'user2', name: 'Bob' }],
      },
    ],
    organizer: {
      name: 'Ethan Hunt',
      email: 'ethan@example.com',
    },
    eventinfo: {
      name: 'Cultural Day',
      description: 'Exploring local art and culture',
      logo: 'culture_day.png',
      image: 'culture_image.png',
      url: 'cultural-day',
    },
    dates: [
      {
        date: '2023-12-14',
        votes: ['user3', 'user4'],
      },
    ],
  },
  {
    status: 'finalized',
    activities: [
      {
        activity: '656f53446b9f52b36fbde090',
        timeslot: {
          from: '2023-12-20T12:30:00.000Z',
          to: '2023-12-20T14:30:00.000Z',
        },
        votes: [{ id: 'user5', name: 'Charlie' }],
      },
    ],
    organizer: {
      name: 'Jenna Coleman',
      email: 'jenna@example.com',
    },
    eventinfo: {
      name: 'Outdoor Adventures',
      description: 'Hiking and exploring nature',
      logo: 'outdoor_adventures.png',
      image: 'outdoor_image.png',
      url: 'outdoor-adventures',
    },
    dates: [
      {
        date: '2023-12-20',
        votes: ['user5', 'user6'],
      },
    ],
    final: {
      date: '2023-12-20',
      activities: [
        {
          activity: '656f53446b9f52b36fbde090',
          timeslot: {
            from: '2023-12-20T12:30:00.000Z',
            to: '2023-12-20T14:30:00.000Z',
          },
          votes: [{ id: 'user5', name: 'Charlie' }],
        },
      ],
    },
  },
  {
    status: 'active',
    activities: [
      {
        activity: {
          name: 'My cool custom activity',
          description: 'This is a custom activity',
          image: 'custom_activity.jpg',
          address: {
            address1: '1234 Custom Road',
            zipcode: '12345',
            city: 'Custom City',
            country: 'USA',
          },
        },
        timeslot: {
          from: '2023-12-15T12:30:00.000Z',
          to: '2023-12-15T14:30:00.000Z',
        },
        votes: [{ id: 'user7', name: 'Diana' }],
      },
    ],
    organizer: {
      name: 'George Lucas',
      email: 'george@example.com',
    },
    eventinfo: {
      name: 'Wellness Weekend',
      description: 'Relaxing activities for health and wellness',
      logo: 'wellness_weekend.png',
      image: 'wellness_weekend_image.png',
      url: 'wellness-weekend',
    },
    dates: [
      {
        date: '2023-12-15',
        votes: ['user8', 'user9'],
      },
      {
        date: '2023-10-15',
        votes: ['user2', 'user1'],
      },
    ],
  },
  {
    status: 'finalized',
    activities: [
      {
        activity: {
          name: 'My cool custom activity2',
          description: 'This is a custom activity2',
          image: 'custom_activit2y.jpg',
          address: {
            address1: '123412313Custom Road',
            zipcode: '12345123',
            city: 'Custom City2',
            country: 'Cool Country',
          },
        },
        timeslot: {
          from: '2023-12-18T12:30:00.000Z',
          to: '2023-12-18T14:30:00.000Z',
        },
        votes: [{ id: 'user10', name: 'Ethan' }],
      },
    ],
    organizer: {
      name: 'Ian Malcolm',
      email: 'ian@example.com',
    },
    eventinfo: {
      name: 'Culinary Exploration',
      description: 'Cooking class for food enthusiasts',
      logo: 'culinary_exploration.png',
      image: 'culinary_exploration_image.png',
      url: 'culinary-exploration',
    },
    dates: [
      {
        date: '2023-12-18',
        votes: ['user11', 'user12'],
      },
      {
        date: '2023-12-06',
        votes: ['user4', 'user2'],
      },
    ],
    final: {
      date: '2023-12-18',
      activities: [
        {
          activity: {
            name: 'My cool custom activity2',
            description: 'This is a custom activity2',
            image: 'custom_activit2y.jpg',
            address: {
              address1: '123412313Custom Road',
              zipcode: '12345123',
              city: 'Custom City2',
              country: 'Cool Country',
            },
          },
          timeslot: {
            from: '2023-12-18T12:30:00.000Z',
            to: '2023-12-18T14:30:00.000Z',
          },
          votes: [{ id: 'user10', name: 'Ethan' }],
        },
      ],
    },
  },
];

export const TESTmockSingleTeemioBody = {
  activities: [
    {
      activity: {
        name: 'A cool activity',
        description: 'padel is fun',
        image: 'A cool activity.jpg',
        address: {
          address1: 'awesome road',
          zipcode: '1231313',
          city: 'Cool City',
          country: 'Cool Country',
        },
      },
      timeslot: {
        from: '2023-12-18T12:30:00.000Z',
        to: '2023-12-18T14:30:00.000Z',
      },
      votes: [{ id: 'user10', name: 'Ethan' }],
    },
  ],
  organizer: {
    name: 'a cool person',
    email: 'hej@hej.com',
    phone: 'string',
  },
  eventinfo: {
    name: 'Padel is fun',
    description: 'join for somepadel',
    logo: 'padel_logo.png',
    image: 'padel_image.png',
    url: 'padel-is-fun',
  },
  dates: [
    {
      date: '2023-12-06',
    },
  ],
};

export const TESTmockSingleActivityBody = {
  name: 'Padel Viborg',
  url: 'padel-viborg',
  description: 'play some more padel',
  image: 'padel.png',
  price: 299,
  persons: 4,
  category: ['sport'],
  address: {
    address1: 'RC',
    address2: '3,2',
    zipcode: '1606',
    city: 'Copenhagen',
    country: 'Denmark',
  },
  referralLink: 'https://www.padel.dk/centre/klover',
  location: {
    lat: 141414,
    long: 3892138,
  },
  estimatedHours: 2,
};

export const TESTmockUpdateTeemioBody = {
  activities: [
    {
      activity: {
        name: 'Updated activity1',
        description: 'this is a new activity',
        image: 'newActivity.jpg',
        address: {
          address1: 'new address',
          zipcode: '1231313',
          city: 'A New City',
          country: 'A New Country',
        },
      },
      timeslot: {
        from: '2023-12-18T19:30:00.000Z',
        to: '2023-12-18T23:30:00.000Z',
      },
    },
    {
      activity: {
        name: 'another activity',
        description: 'its fun',
        image: 'wafknwaifn.jpg',
        address: {
          address1: 'cool address',
          zipcode: '88894',
          city: 'Random City',
          country: 'Random Country',
        },
      },
      timeslot: {
        from: '2023-12-18T10:30:00.000Z',
        to: '2023-12-18T14:30:00.000Z',
      },
    },
  ],
  eventinfo: {
    name: 'New cool event',
    description: 'you should come to this event its cool',
    logo: 'coollogo.png',
    image: 'cool_image.png',
    url: 'new-cool-event',
  },
  dates: [
    {
      date: '2023-05-06',
    },
  ],
};

export const TESTmockTeemioVoteBody = {
  activitiesVotedOn: [
    {
      activity: 'string',
    },
  ],
  datesVotedOn: ['2023-12-06'],
  userinfo: {
    name: 'string',
    email: 'string',
  },
};

export const TESTmockTeemioFinalizeBody = {
  activities: [
    {
      activity: {
        name: 'My cool custom activity2',
        description: 'This is a custom activity2',
        image: 'custom_activit2y.jpg',
        address: {
          address1: '123412313Custom Road',
          zipcode: '12345123',
          city: 'Custom City2',
          country: 'Cool Country',
        },
        timeslot: {
          from: '2023-12-18T12:30:00.000Z',
          to: '2023-12-18T14:30:00.000Z',
        },
      },
      votes: [{ id: 'user10', name: 'Ethan' }],
    },
  ],
  date: '2023-12-18',
  sendInvites: true,
};

export const TESTmockUserBody = {
  name: 'weaofwaoef',
  email: 'kwaenmfwaf@test.com',
  phone: '3123139813',
  type: 'user',
};
