export type DirectoryCategoryGroup = {
  name: string;
  subcategories: string[];
};

export type NilgirisLocationGroup = {
  taluk: string;
  places: string[];
};

export const businessCategoryGroups: DirectoryCategoryGroup[] = [
  {
    name: "Stay",
    subcategories: [
      "Hotel",
      "Resort",
      "Homestay",
      "Hostel",
      "Cottage",
      "Villa",
      "Guest House",
      "Lodge",
      "Service Apartment",
      "Farm Stay",
      "Camping",
      "Dormitory",
    ],
  },
  {
    name: "Food & Dining",
    subcategories: [
      "Restaurant",
      "Cafe",
      "Bakery",
      "Tea Shop",
      "Fast Food",
      "Street Food",
      "Catering",
      "Cloud Kitchen",
      "Sweet Shop",
      "Juice Shop",
      "Ice Cream Shop",
      "Vegetarian Restaurant",
      "Non-Vegetarian Restaurant",
      "Hotel Dining",
    ],
  },
  {
    name: "Taxi & Transport",
    subcategories: [
      "Taxi",
      "Cab Service",
      "Auto",
      "Bus Service",
      "Tour Operator",
      "Travel Agency",
      "Car Rental",
      "Bike Rental",
      "Tempo Traveller",
      "Goods Transport",
      "Parcel Service",
      "Driver Service",
      "Vehicle Recovery",
    ],
  },
  {
    name: "Tourism",
    subcategories: [
      "Tourist Place",
      "View Point",
      "Waterfall",
      "Lake",
      "Garden",
      "Museum",
      "Heritage Site",
      "Wildlife Attraction",
      "Tea Estate Visit",
      "Tribal Tourism",
      "Local Guide",
      "Tour Package",
      "Photography Spot",
      "Picnic Spot",
    ],
  },
  {
    name: "Shopping",
    subcategories: [
      "Supermarket",
      "Grocery Store",
      "Vegetable Shop",
      "Fruit Shop",
      "Clothing Store",
      "Footwear Store",
      "Jewellery Store",
      "Gift Shop",
      "Toy Shop",
      "Stationery Shop",
      "Electronics Store",
      "Mobile Shop",
      "Computer Shop",
      "Furniture Store",
      "Home Appliances",
      "Hardware Store",
      "Department Store",
      "Wholesale Store",
      "Local Market",
    ],
  },
  {
    name: "Tea & Local Products",
    subcategories: [
      "Tea Shop",
      "Tea Factory",
      "Tea Estate",
      "Tea Outlet",
      "Spices Shop",
      "Chocolate Shop",
      "Eucalyptus Products",
      "Essential Oils",
      "Honey Shop",
      "Organic Products",
      "Handicrafts",
      "Homemade Products",
      "Nilgiris Souvenirs",
    ],
  },
  {
    name: "Adventure",
    subcategories: [
      "Trekking",
      "Camping",
      "Cycling",
      "Mountain Biking",
      "Horse Riding",
      "Off-Road Experience",
      "Nature Walk",
      "Bird Watching",
      "Wildlife Safari",
      "Outdoor Activity",
      "Adventure Tour Operator",
    ],
  },
  {
    name: "Events & Entertainment",
    subcategories: [
      "Event Planner",
      "Wedding Planner",
      "Decorator",
      "DJ",
      "Music Band",
      "Sound Service",
      "Lighting Service",
      "Stage Service",
      "Party Hall",
      "Wedding Hall",
      "Convention Centre",
      "Cinema",
      "Gaming Centre",
      "Kids Entertainment",
    ],
  },
  {
    name: "Education & Training",
    subcategories: [
      "School",
      "College",
      "Training Institute",
      "Tuition Centre",
      "Computer Training",
      "Language Training",
      "Coaching Centre",
      "Music Class",
      "Dance Class",
      "Driving School",
      "Skill Development",
      "Online Training",
      "Library",
      "Day Care",
    ],
  },
  {
    name: "Healthcare",
    subcategories: [
      "Hospital",
      "Clinic",
      "Dental Clinic",
      "Diagnostic Centre",
      "Pharmacy",
      "Medical Shop",
      "Physiotherapy",
      "Eye Care",
      "Ayurveda",
      "Homeopathy",
      "Veterinary Clinic",
      "Ambulance",
      "Home Nursing",
      "Medical Equipment",
    ],
  },
  {
    name: "Home Services",
    subcategories: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Painter",
      "Cleaning Service",
      "Pest Control",
      "Appliance Repair",
      "AC Service",
      "Refrigerator Repair",
      "Washing Machine Repair",
      "Water Tank Cleaning",
      "Gardening",
      "Security Service",
      "Housekeeping",
      "Packers and Movers",
    ],
  },
  {
    name: "Professional Services",
    subcategories: [
      "Accountant",
      "Auditor",
      "Lawyer",
      "Consultant",
      "Insurance Service",
      "Loan Service",
      "Real Estate",
      "Architect",
      "Interior Designer",
      "Web Developer",
      "Software Company",
      "Digital Marketing",
      "Graphic Designer",
      "Photographer",
      "Videographer",
      "Printing Service",
      "Courier Service",
    ],
  },
  {
    name: "Automobile",
    subcategories: [
      "Car Service",
      "Bike Service",
      "Tyre Shop",
      "Battery Shop",
      "Spare Parts",
      "Car Wash",
      "Bike Wash",
      "Mechanic",
      "Vehicle Accessories",
      "Driving School",
      "Petrol Station",
      "EV Charging",
      "Towing Service",
    ],
  },
  {
    name: "Beauty & Wellness",
    subcategories: [
      "Beauty Parlour",
      "Salon",
      "Spa",
      "Massage Centre",
      "Fitness Centre",
      "Gym",
      "Yoga Centre",
      "Makeup Artist",
      "Bridal Service",
      "Wellness Centre",
      "Nutrition Service",
    ],
  },
  {
    name: "Construction & Property",
    subcategories: [
      "Builder",
      "Contractor",
      "Civil Engineer",
      "Architect",
      "Interior Designer",
      "Building Materials",
      "Cement Shop",
      "Steel Shop",
      "Tiles Shop",
      "Plumbing Materials",
      "Electrical Materials",
      "Real Estate",
      "Property Management",
      "Land Surveyor",
    ],
  },
  {
    name: "Agriculture & Farming",
    subcategories: [
      "Farm",
      "Nursery",
      "Seeds Shop",
      "Fertiliser Shop",
      "Agricultural Equipment",
      "Organic Farm",
      "Flower Farm",
      "Vegetable Farm",
      "Dairy Farm",
      "Poultry Farm",
      "Farm Supplies",
      "Farm Consultancy",
    ],
  },
  {
    name: "Pet Services",
    subcategories: [
      "Pet Shop",
      "Veterinary Clinic",
      "Pet Grooming",
      "Pet Boarding",
      "Pet Food",
      "Dog Trainer",
      "Animal Rescue",
    ],
  },
  {
    name: "Emergency Services",
    subcategories: [
      "Ambulance",
      "Hospital Emergency",
      "Police Station",
      "Fire Station",
      "Vehicle Recovery",
      "Disaster Support",
      "Blood Bank",
      "Emergency Helpline",
    ],
  },
  {
    name: "Government & Public Services",
    subcategories: [
      "Government Office",
      "Municipality",
      "Town Panchayat",
      "Village Panchayat",
      "Post Office",
      "Police Station",
      "Fire Station",
      "Public Distribution Shop",
      "Citizen Service Centre",
      "Electricity Office",
      "Water Service",
      "Bank",
      "ATM",
    ],
  },
  {
    name: "Other",
    subcategories: [
      "Other Business",
      "Other Service",
      "Community Organisation",
      "Non-Profit Organisation",
      "Religious Place",
      "Local Association",
    ],
  },
];

export const mainBusinessCategories = [
  "All",
  ...businessCategoryGroups.map((group) => group.name),
];

export const allBusinessSubcategories = Array.from(
  new Set(
    businessCategoryGroups.flatMap(
      (group) => group.subcategories
    )
  )
).sort((first, second) =>
  first.localeCompare(second)
);

export function getBusinessSubcategories(
  category: string
): string[] {
  return (
    businessCategoryGroups.find(
      (group) => group.name === category
    )?.subcategories ?? []
  );
}

export const nilgirisTaluks = [
  "All Nilgiris",
  "Udhagamandalam / Ooty",
  "Kundah",
  "Coonoor",
  "Kotagiri",
  "Gudalur",
  "Pandalur",
];

export const nilgirisLocationGroups: NilgirisLocationGroup[] = [
  {
    taluk: "Udhagamandalam / Ooty",
    places: [
      "Udhagamandalam / Ooty",
      "Udhagamandalam Rural",
      "Udhagamandalam Town East",
      "Udhagamandalam Town West",
      "Hullathy",
      "Kadanad I",
      "Kadanad II",
      "Masinagudi",
      "Naduvattam",
      "Sholur",
      "Ebbanad I",
      "Ebbanad II",
      "Kagguchi I",
      "Kagguchi II",
      "Kookal",
      "Thummanatty I",
      "Thummanatty II",
      "Thuneri",
      "Nanjanad I",
      "Nanjanad II",
      "Lovedale",
      "Fern Hill",
      "Fingerpost",
      "Charing Cross",
      "Elk Hill",
      "Kandal",
      "Westbury",
      "Bombay Castle",
      "Doddabetta",
      "Pykara",
      "Avalanche",
      "Emerald",
      "Glenmorgan",
      "Mukurthi",
    ],
  },
  {
    taluk: "Kundah",
    places: [
      "Kundah",
      "Bikkatty",
      "Ithalar I",
      "Ithalar II",
      "Mulligoor",
      "Balacola I",
      "Balacola II",
      "Kil Kundah I",
      "Kil Kundah II",
      "Kinnakorai",
      "Mel Kundah",
      "Manjoor",
      "Upper Bhavani",
      "Emerald",
      "Avalanche",
    ],
  },
  {
    taluk: "Coonoor",
    places: [
      "Coonoor",
      "Coonoor Town",
      "Coonoor Rural",
      "Burliar",
      "Yedapally",
      "Ketti I",
      "Ketti II",
      "Ketti III",
      "Adigaratty I",
      "Adigaratty II",
      "Melur I",
      "Melur II",
      "Melur III",
      "Hulical I",
      "Hulical II",
      "Hubathalai",
      "Wellington",
      "Aruvankadu",
      "Jagathala",
      "Bandishola",
      "Sim's Park",
      "Dolphin's Nose",
      "Lamb's Rock",
    ],
  },
  {
    taluk: "Kotagiri",
    places: [
      "Kotagiri",
      "Kil Kotagiri",
      "Aracode",
      "Denad I",
      "Denad II",
      "Kadinamala",
      "Kengarai I",
      "Kengarai II",
      "Kokodu",
      "Konavakorai I",
      "Konavakorai II",
      "Nandhipuram",
      "Jackanarai",
      "Jagathala I",
      "Jagathala II",
      "Kotagiri I",
      "Kotagiri II",
      "Kotagiri III",
      "Naduhatty I",
      "Naduhatty II",
      "Hallimoyar",
      "Kallampalayam",
      "Kodanad",
      "Nedugula I",
      "Nedugula II",
      "Kattabettu",
      "Kunjappanai",
      "Thengumarahada",
      "Kodanad View Point",
    ],
  },
  {
    taluk: "Gudalur",
    places: [
      "Gudalur",
      "Cherumulli I",
      "Cherumulli II",
      "Mudumalai",
      "Nellakotta",
      "Sree Madurai",
      "Devala I",
      "Devala II",
      "Gudalur I",
      "Gudalur II",
      "O'Valley I",
      "O'Valley II",
      "Padanthorai I",
      "Padanthorai II",
      "Devarshola",
      "Thorapalli",
      "Naduvattam",
      "Masinagudi",
      "Theppakadu",
    ],
  },
  {
    taluk: "Pandalur",
    places: [
      "Pandalur",
      "Cherangode I",
      "Cherangode II",
      "Erumad I",
      "Erumad II",
      "Moonad I",
      "Moonad II",
      "Nelliyalam I",
      "Nelliyalam II",
      "Cherambadi",
      "Devala",
      "Nelliyalam",
      "Uppatti",
      "Ayyankolly",
      "Kolapally",
    ],
  },
];

export const nilgirisMunicipalities = [
  "Udhagamandalam",
  "Coonoor",
  "Gudalur",
  "Nelliyalam",
  "Kotagiri",
];

export const nilgirisTownPanchayats = [
  "Devarshola",
  "Jegathala",
  "Ketti",
  "Hulical",
  "Kil Kundah",
  "Athigaratty",
  "Naduvattam",
  "Sholur",
  "Bikkatti",
  "O'Valley",
];

export const nilgirisVillagePanchayats = [
  "Kadanad",
  "Ebbanad",
  "Hullathy",
  "Kagguchi",
  "Thummanatty",
  "Nanjanad",
  "Thuneri",
  "Mulligoor",
  "Mel Kundha",
  "Balacola",
  "Doddabetta",
  "Ithalar",
  "Kookal",
  "Hubbathalai",
  "Yedappalli",
  "Melur",
  "Burliyar",
  "Bandishola",
  "Beratty",
  "Thengumarahada",
  "Aracode",
  "Kadinamala",
  "Kodanad",
  "Nedugula",
  "Denad",
  "Kengarai",
  "Konavakkarai",
  "Naduhatty",
  "Jackanarai",
  "Kunjappanai",
  "Cherangodu",
  "Nellakotta",
  "Mudumalai",
  "Sreemadurai",
  "Masinagudi",
];

export const allNilgirisLocations = [
  "All Nilgiris",
  ...Array.from(
    new Set([
      ...nilgirisLocationGroups.flatMap(
        (group) => group.places
      ),
      ...nilgirisMunicipalities,
      ...nilgirisTownPanchayats,
      ...nilgirisVillagePanchayats,
    ])
  ).sort((first, second) =>
    first.localeCompare(second)
  ),
  "Other Nilgiris Location",
];

export function getLocationsForTaluk(
  taluk: string
): string[] {
  if (!taluk || taluk === "All Nilgiris") {
    return allNilgirisLocations;
  }

  return (
    nilgirisLocationGroups.find(
      (group) => group.taluk === taluk
    )?.places ?? []
  );
}

export function findTalukForLocation(
  location: string
): string {
  return (
    nilgirisLocationGroups.find(
      (group) =>
        group.places.includes(location)
    )?.taluk ?? "Other Nilgiris Location"
  );
}
