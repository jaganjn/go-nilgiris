import Link from "next/link";

const businesses = {
  "sterling-ooty": {
    name: "Sterling Ooty Fern Hill",
    category: "Hotel",
    location: "Fern Hill, Ooty",
    rating: "4.5",
    reviews: "1,248 reviews",
    icon: "🏨",
    description:
      "Sterling Ooty Fern Hill is a scenic hill resort offering comfortable rooms, family-friendly facilities and beautiful views of the Nilgiris. It is suitable for families, couples and weekend travellers looking for a peaceful stay near Ooty.",
    address: "Fern Hill, Ooty, Tamil Nadu 643004",
    phone: "+91 98765 43210",
    hours: "Open 24 hours",
    highlights: [
      "Mountain-view rooms",
      "Family-friendly stay",
      "Restaurant and room service",
      "Parking available",
      "Close to major Ooty attractions",
      "Suitable for couples and groups",
    ],
  },
  "green-valley-homestay": {
    name: "Green Valley Homestay",
    category: "Homestay",
    location: "Coonoor",
    rating: "4.7",
    reviews: "326 reviews",
    icon: "🏡",
    description:
      "Green Valley Homestay offers a calm and comfortable stay surrounded by tea gardens and green hills. Guests can enjoy a local experience, peaceful surroundings and easy access to nearby Coonoor attractions.",
    address: "Upper Coonoor, Tamil Nadu 643101",
    phone: "+91 98765 43211",
    hours: "Open 24 hours",
    highlights: [
      "Tea estate views",
      "Homely food",
      "Family rooms",
      "Free parking",
      "Peaceful location",
      "Local sightseeing support",
    ],
  },
  "earls-secret": {
    name: "Earl's Secret",
    category: "Restaurant",
    location: "Ooty",
    rating: "4.6",
    reviews: "892 reviews",
    icon: "🍽️",
    description:
      "Earl's Secret is a popular dining destination in Ooty known for its colonial atmosphere, scenic surroundings and quality food. It is a good choice for families, couples and visitors looking for a relaxed dining experience.",
    address: "Havelock Road, Ooty, Tamil Nadu 643001",
    phone: "+91 98765 43212",
    hours: "11:00 AM – 10:00 PM",
    highlights: [
      "Colonial-style ambience",
      "Indoor and outdoor seating",
      "Family-friendly dining",
      "Vegetarian options",
      "Popular tourist location",
      "Advance reservation recommended",
    ],
  },
  "nilgiris-taxi-service": {
    name: "Nilgiris Taxi Service",
    category: "Taxi",
    location: "Ooty, Coonoor and Kotagiri",
    rating: "4.8",
    reviews: "541 reviews",
    icon: "🚕",
    description:
      "Nilgiris Taxi Service provides local sightseeing, railway station pickup, airport transfers and customised travel packages across Ooty, Coonoor, Kotagiri and nearby hill areas.",
    address: "Commercial Road, Ooty, Tamil Nadu 643001",
    phone: "+91 98765 43213",
    hours: "Open 24 hours",
    highlights: [
      "Local sightseeing packages",
      "Airport and railway pickup",
      "Experienced local drivers",
      "One-way and round-trip services",
      "Family and group vehicles",
      "Custom travel plans",
    ],
  },
  "tea-factory-museum": {
    name: "Tea Factory
