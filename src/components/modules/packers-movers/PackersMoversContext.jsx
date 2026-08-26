import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppStateContext } from '../../../context/AppState';

export const PackersMoversContext = createContext();

// Initial Seed Data for Instant Admin Configuration
const INITIAL_SERVICE_TYPES = [
  { id: 'within-city', name: 'Within City', description: 'Local house or apartment shifting inside the city limits', icon: '🚚', isActive: true, sortOrder: 1 },
  { id: 'between-cities', name: 'Between Cities', description: 'Long-distance inter-city relocation across cities and states', icon: '🛣️', isActive: true, sortOrder: 2 },
  { id: 'home-shifting', name: 'Home Shifting', description: 'Complete 1BHK, 2BHK, 3BHK+, villa house relocation service', icon: '🏠', isActive: true, sortOrder: 3 },
  { id: 'office-shifting', name: 'Office Shifting', description: 'Corporate, workstations, servers and commercial office moving', icon: '🏢', isActive: true, sortOrder: 4 },
  { id: 'furniture-shifting', name: 'Furniture Shifting', description: 'Few heavy items, single sofa, bed, wardrobe or appliances', icon: '🛋️', isActive: true, sortOrder: 5 },
  { id: 'vehicle-transport', name: 'Vehicle / Bike Transport', description: 'Two-wheeler and four-wheeler secured vehicle relocation', icon: '🛵', isActive: true, sortOrder: 6 },
  { id: 'custom-moving', name: 'Custom Moving Service', description: 'Customized tailored shifting package for unique client needs', icon: '✨', isActive: true, sortOrder: 7 }
];

const INITIAL_WITHIN_CITY_AREAS = [
  { id: 'hyd-gachibowli', city: 'Hyderabad', areaName: 'Gachibowli', zone: 'West Zone', isActive: true },
  { id: 'hyd-kondapur', city: 'Hyderabad', areaName: 'Kondapur', zone: 'West Zone', isActive: true },
  { id: 'hyd-madhapur', city: 'Hyderabad', areaName: 'Madhapur', zone: 'West Zone', isActive: true },
  { id: 'hyd-kukatpally', city: 'Hyderabad', areaName: 'Kukatpally', zone: 'North Zone', isActive: true },
  { id: 'hyd-banjara-hills', city: 'Hyderabad', areaName: 'Banjara Hills', zone: 'Central Zone', isActive: true },
  { id: 'hyd-jubilee-hills', city: 'Hyderabad', areaName: 'Jubilee Hills', zone: 'Central Zone', isActive: true },
  { id: 'hyd-secunderabad', city: 'Hyderabad', areaName: 'Secunderabad', zone: 'North Zone', isActive: true },
  { id: 'hyd-hitec-city', city: 'Hyderabad', areaName: 'HITEC City', zone: 'West Zone', isActive: true },
  { id: 'hyd-begumpet', city: 'Hyderabad', areaName: 'Begumpet', zone: 'Central Zone', isActive: true },
  { id: 'hyd-dilsukhnagar', city: 'Hyderabad', areaName: 'Dilsukhnagar', zone: 'East Zone', isActive: true }
];

const INITIAL_INTERCITY_ROUTES = [
  { id: 'hyd-vga', sourceCity: 'Hyderabad', destCity: 'Vijayawada', baseDistanceKm: 275, baseFare: 8000, pricePerKm: 30, minFare: 8000, estimatedHours: '6-8 hrs', isActive: true },
  { id: 'hyd-blr', sourceCity: 'Hyderabad', destCity: 'Bangalore', baseDistanceKm: 570, baseFare: 15000, pricePerKm: 35, minFare: 15000, estimatedHours: '12-16 hrs', isActive: true },
  { id: 'hyd-maa', sourceCity: 'Hyderabad', destCity: 'Chennai', baseDistanceKm: 630, baseFare: 16500, pricePerKm: 35, minFare: 16500, estimatedHours: '14-18 hrs', isActive: true },
  { id: 'hyd-bom', sourceCity: 'Hyderabad', destCity: 'Mumbai', baseDistanceKm: 710, baseFare: 21000, pricePerKm: 38, minFare: 21000, estimatedHours: '18-24 hrs', isActive: true },
  { id: 'hyd-pnq', sourceCity: 'Hyderabad', destCity: 'Pune', baseDistanceKm: 560, baseFare: 16000, pricePerKm: 34, minFare: 16000, estimatedHours: '12-15 hrs', isActive: true }
];

const INITIAL_TIME_SLOTS = [
  { id: 'slot-1', label: '07:00 AM – 09:00 AM', startTime: '07:00', endTime: '09:00', maxBookings: 6, currentBookings: 2, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], city: 'Hyderabad', isActive: true },
  { id: 'slot-2', label: '09:00 AM – 11:00 AM', startTime: '09:00', endTime: '11:00', maxBookings: 10, currentBookings: 8, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], city: 'Hyderabad', isActive: true },
  { id: 'slot-3', label: '11:00 AM – 01:00 PM', startTime: '11:00', endTime: '13:00', maxBookings: 10, currentBookings: 5, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], city: 'Hyderabad', isActive: true },
  { id: 'slot-4', label: '02:00 PM – 04:00 PM', startTime: '14:00', endTime: '16:00', maxBookings: 8, currentBookings: 3, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], city: 'Hyderabad', isActive: true },
  { id: 'slot-5', label: '04:00 PM – 06:00 PM', startTime: '16:00', endTime: '18:00', maxBookings: 8, currentBookings: 6, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], city: 'Hyderabad', isActive: true },
  { id: 'slot-6', label: '06:00 PM – 08:00 PM', startTime: '18:00', endTime: '20:00', maxBookings: 4, currentBookings: 4, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], city: 'Hyderabad', isActive: true }
];

const INITIAL_CATEGORIES = [
  { id: 'living-room', name: 'Living Room', icon: '🛋️', description: 'Sofas, TV units, coffee tables, carpets, recliner chairs', sortOrder: 1, isActive: true },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️', description: 'Beds, mattresses, wardrobes, dressing tables, side units', sortOrder: 2, isActive: true },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', description: 'Refrigerator, microwave, gas stoves, utensil boxes, mixers', sortOrder: 3, isActive: true },
  { id: 'dining', name: 'Dining', icon: '🪑', description: 'Dining table sets, chairs, crockery cabinets, bar units', sortOrder: 4, isActive: true },
  { id: 'electronics', name: 'Electronics & Appliances', icon: '📺', description: 'LED TVs, washing machines, AC units, geysers, coolers', sortOrder: 5, isActive: true },
  { id: 'office', name: 'Office & Study', icon: '💻', description: 'Work desks, ergonomic chairs, bookshelves, filing cabinets', sortOrder: 6, isActive: true },
  { id: 'other', name: 'Others & Miscellaneous', icon: '📦', description: 'Plants, luggage bags, bicycles, carton boxes, gym items', sortOrder: 7, isActive: true }
];

const INITIAL_ITEMS = [
  { id: 'item-1', name: '3-Seater Sofa', categoryId: 'living-room', defaultQty: 1, volumeCuFt: 60, weightKg: 80, packingRequired: true, dismantlingAvailable: true, isFragile: false, baseHandling: 300, packingPrice: 250, dismantlingPrice: 200, reassemblyPrice: 200, image: 'https://cdn-icons-png.flaticon.com/512/2663/2663580.png', isActive: true },
  { id: 'item-2', name: '2-Seater Sofa / Loveseat', categoryId: 'living-room', defaultQty: 1, volumeCuFt: 45, weightKg: 55, packingRequired: true, dismantlingAvailable: false, isFragile: false, baseHandling: 250, packingPrice: 200, dismantlingPrice: 0, reassemblyPrice: 0, image: 'https://cdn-icons-png.flaticon.com/512/2663/2663580.png', isActive: true },
  { id: 'item-3', name: 'Single Recliner Chair', categoryId: 'living-room', defaultQty: 1, volumeCuFt: 30, weightKg: 40, packingRequired: true, dismantlingAvailable: false, isFragile: false, baseHandling: 200, packingPrice: 150, dismantlingPrice: 0, reassemblyPrice: 0, image: 'https://cdn-icons-png.flaticon.com/512/2663/2663580.png', isActive: true },
  { id: 'item-4', name: 'King Size Bed with Storage', categoryId: 'bedroom', defaultQty: 1, volumeCuFt: 90, weightKg: 110, packingRequired: true, dismantlingAvailable: true, isFragile: false, baseHandling: 500, packingPrice: 350, dismantlingPrice: 400, reassemblyPrice: 400, image: 'https://cdn-icons-png.flaticon.com/512/3030/3030336.png', isActive: true },
  { id: 'item-5', name: 'Queen Size Bed', categoryId: 'bedroom', defaultQty: 1, volumeCuFt: 75, weightKg: 85, packingRequired: true, dismantlingAvailable: true, isFragile: false, baseHandling: 400, packingPrice: 300, dismantlingPrice: 350, reassemblyPrice: 350, image: 'https://cdn-icons-png.flaticon.com/512/3030/3030336.png', isActive: true },
  { id: 'item-6', name: 'King / Queen Mattress', categoryId: 'bedroom', defaultQty: 1, volumeCuFt: 35, weightKg: 35, packingRequired: true, dismantlingAvailable: false, isFragile: false, baseHandling: 250, packingPrice: 200, dismantlingPrice: 0, reassemblyPrice: 0, image: 'https://cdn-icons-png.flaticon.com/512/3030/3030336.png', isActive: true },
  { id: 'item-7', name: '3-Door Wooden Wardrobe', categoryId: 'bedroom', defaultQty: 1, volumeCuFt: 85, weightKg: 95, packingRequired: true, dismantlingAvailable: true, isFragile: false, baseHandling: 600, packingPrice: 400, dismantlingPrice: 500, reassemblyPrice: 500, image: 'https://cdn-icons-png.flaticon.com/512/2400/2400622.png', isActive: true },
  { id: 'item-8', name: 'Double Door Refrigerator', categoryId: 'kitchen', defaultQty: 1, volumeCuFt: 45, weightKg: 75, packingRequired: true, dismantlingAvailable: false, isFragile: true, baseHandling: 400, packingPrice: 300, dismantlingPrice: 0, reassemblyPrice: 0, image: 'https://cdn-icons-png.flaticon.com/512/869/869636.png', isActive: true },
  { id: 'item-9', name: 'Front Load Washing Machine', categoryId: 'electronics', defaultQty: 1, volumeCuFt: 30, weightKg: 65, packingRequired: true, dismantlingAvailable: true, isFragile: true, baseHandling: 350, packingPrice: 250, dismantlingPrice: 150, reassemblyPrice: 150, image: 'https://cdn-icons-png.flaticon.com/512/963/963882.png', isActive: true },
  { id: 'item-10', name: '55" / 65" Smart LED TV', categoryId: 'electronics', defaultQty: 1, volumeCuFt: 25, weightKg: 28, packingRequired: true, dismantlingAvailable: true, isFragile: true, baseHandling: 450, packingPrice: 400, dismantlingPrice: 250, reassemblyPrice: 250, image: 'https://cdn-icons-png.flaticon.com/512/771/771249.png', isActive: true },
  { id: 'item-11', name: 'Split AC (Indoor + Outdoor Unit)', categoryId: 'electronics', defaultQty: 1, volumeCuFt: 35, weightKg: 50, packingRequired: true, dismantlingAvailable: true, isFragile: true, baseHandling: 500, packingPrice: 350, dismantlingPrice: 600, reassemblyPrice: 800, image: 'https://cdn-icons-png.flaticon.com/512/911/911414.png', isActive: true },
  { id: 'item-12', name: '6-Seater Dining Table Set', categoryId: 'dining', defaultQty: 1, volumeCuFt: 70, weightKg: 80, packingRequired: true, dismantlingAvailable: true, isFragile: true, baseHandling: 500, packingPrice: 350, dismantlingPrice: 300, reassemblyPrice: 300, image: 'https://cdn-icons-png.flaticon.com/512/3030/3030310.png', isActive: true }
];

const INITIAL_PACKING_SERVICES = [
  { id: 'pack-standard', name: 'Standard Packing', description: 'Corrugated sheets, shrink wrap and high-grade adhesive tapes for normal furniture & electronics', priceType: 'per_item', price: 60, minCharge: 600, materialCharge: 300, labourCharge: 300, isActive: true },
  { id: 'pack-premium', name: 'Premium Multi-layer Packing', description: '3-layer bubble wrap, foam corner guards, heavy-duty carton boxes and waterproof stretch wrap', priceType: 'per_item', price: 120, minCharge: 1200, materialCharge: 700, labourCharge: 500, isActive: true },
  { id: 'pack-none', name: 'No Packing (Transport Only)', description: 'Customer packs items themselves; our team only handles loading, transit, and unloading', priceType: 'fixed', price: 0, minCharge: 0, materialCharge: 0, labourCharge: 0, isActive: true }
];

const INITIAL_ADDITIONAL_SERVICES = {
  dismantlingRatePerItem: 200,
  reassemblyRatePerItem: 250,
  unpackingFixedRate: 600,
  extraLabourRatePerHour: 350,
  stairsChargePerFloor: 150,
  groundFloorCharge: 0,
  firstFloorCharge: 100,
  secondFloorCharge: 200,
  thirdFloorCharge: 300,
  fourthPlusFloorCharge: 450,
  liftAvailableDiscountOrFree: 0,
  noLiftSurchargePerFloor: 150,
  heavyItemHandlingFee: 400,
  fragileHandlingFee: 300,
  longCarryChargeAbove50m: 350
};

const INITIAL_VEHICLES = [
  { id: 'pm-tata-ace', name: 'Tata Ace (Chota Hathi)', capacityCuFt: 250, capacityKg: 850, baseFare: 1800, perKmFare: 22, minFare: 1800, driverCharge: 400, loadingCharge: 400, unloadingCharge: 400, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', isActive: true },
  { id: 'pm-14ft', name: '14 FT Covered Truck', capacityCuFt: 700, capacityKg: 2500, baseFare: 3200, perKmFare: 28, minFare: 3200, driverCharge: 600, loadingCharge: 800, unloadingCharge: 800, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', isActive: true },
  { id: 'pm-17ft', name: '17 FT Container Truck', capacityCuFt: 1000, capacityKg: 4000, baseFare: 4800, perKmFare: 35, minFare: 4800, driverCharge: 800, loadingCharge: 1200, unloadingCharge: 1200, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', isActive: true },
  { id: 'pm-20ft', name: '20 FT Heavy Truck', capacityCuFt: 1400, capacityKg: 6000, baseFare: 6500, perKmFare: 42, minFare: 6500, driverCharge: 1000, loadingCharge: 1500, unloadingCharge: 1500, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', isActive: true },
  { id: 'pm-22ft', name: '22 FT Multi-Axle Container', capacityCuFt: 1800, capacityKg: 8000, baseFare: 8500, perKmFare: 48, minFare: 8500, driverCharge: 1200, loadingCharge: 2000, unloadingCharge: 2000, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', isActive: true }
];

const INITIAL_LABOUR_TIERS = [
  { id: 'labour-2', workers: 2, label: '2 Movers & Helpers', baseCharge: 1200, minHours: 3, perHourExtra: 350, isActive: true },
  { id: 'labour-3', workers: 3, label: '3 Movers & Helpers', baseCharge: 1800, minHours: 3, perHourExtra: 500, isActive: true },
  { id: 'labour-4', workers: 4, label: '4 Movers & Helpers (Standard 2BHK)', baseCharge: 2400, minHours: 4, perHourExtra: 650, isActive: true },
  { id: 'labour-5', workers: 5, label: '5 Movers & Helpers (3BHK / Villa)', baseCharge: 3000, minHours: 4, perHourExtra: 800, isActive: true },
  { id: 'labour-6', workers: 6, label: '6 Professional Moving Crew', baseCharge: 3600, minHours: 4, perHourExtra: 950, isActive: true }
];

const INITIAL_PRICING_RULES = {
  baseFareEnabled: true,
  distanceCalculation: 'google_matrix_km',
  gstPercentage: 18,
  porterPlatformCutPercent: 10,
  minBookingCharge: 2500,
  surgeMultiplier: 1.0,
  weekendMultiplier: 1.1,
  nightMoveSurchargePercent: 15
};

const INITIAL_COUPONS = [
  { id: 'cpn-1', code: 'MOVE500', discountType: 'fixed', discountVal: 500, minBooking: 5000, maxDiscount: 500, validFrom: '2026-08-01', validUntil: '2026-12-31', applicableCity: 'All', usageLimit: 500, usedCount: 84, isActive: true },
  { id: 'cpn-2', code: 'SHIFT20', discountType: 'percent', discountVal: 20, minBooking: 8000, maxDiscount: 2000, validFrom: '2026-08-15', validUntil: '2026-09-30', applicableCity: 'Hyderabad', usageLimit: 200, usedCount: 42, isActive: true },
  { id: 'cpn-3', code: 'INTERCITY1000', discountType: 'fixed', discountVal: 1000, minBooking: 15000, maxDiscount: 1000, validFrom: '2026-08-01', validUntil: '2026-12-31', applicableCity: 'Inter-City', usageLimit: 100, usedCount: 19, isActive: true }
];

const INITIAL_BOOKINGS = [
  {
    id: 'ANP-PM-8921',
    bookingId: 'ANP-PM-8921',
    customer: { name: 'Rahul Sharma', phone: '9848022338', email: 'rahul.s@gmail.com' },
    serviceType: 'home-shifting',
    serviceTypeName: 'Home Shifting (2BHK)',
    sourceCity: 'Hyderabad',
    destCity: 'Hyderabad',
    pickup: { address: 'Flat 402, Aditya Elite, Gachibowli, Hyderabad', floor: 4, hasLift: true, parkingDistanceM: 20, contactPhone: '9848022338' },
    drop: { address: 'Villa 18, Rainbow Meadows, Kondapur, Hyderabad', floor: 1, hasLift: false, parkingDistanceM: 10, contactPhone: '9848022338' },
    moveDate: '2026-08-27',
    timeSlot: '09:00 AM – 11:00 AM',
    itemsCount: 26,
    itemsList: [
      { name: '3-Seater Sofa', qty: 1, packing: true, dismantling: true },
      { name: 'King Size Bed', qty: 1, packing: true, dismantling: true },
      { name: 'Double Door Refrigerator', qty: 1, packing: true, dismantling: false },
      { name: '55" Smart LED TV', qty: 1, packing: true, dismantling: true },
      { name: 'Washing Machine', qty: 1, packing: true, dismantling: false },
      { name: 'Dining Table + 4 Chairs', qty: 1, packing: true, dismantling: true },
      { name: 'Wardrobe 3-Door', qty: 1, packing: true, dismantling: true },
      { name: 'Carton Boxes (Clothes/Kitchen)', qty: 12, packing: false, dismantling: false }
    ],
    packingType: 'Standard Packing',
    vehicle: { id: 'pm-14ft', name: '14 FT Covered Truck', number: 'TS 08 UB 4512' },
    labour: { workers: 4, label: '4 Movers & Helpers' },
    team: { id: 'team-101', name: 'Alpha Movers Unit', leaderName: 'Suresh Kumar', phone: '9876543210', rating: 4.8 },
    driver: { name: 'Ramesh Reddy', phone: '9123456789' },
    pricing: { baseFare: 3200, distanceKm: 12, distanceFare: 336, packingCharge: 1200, labourCharge: 2400, floorHandling: 300, dismantlingCharge: 800, discount: 500, gst: 1392, totalAmount: 9128, paidAmount: 9128, pendingAmount: 0 },
    paymentStatus: 'PAID',
    paymentMethod: 'UPI / Online',
    status: 'TRANSIT',
    timeline: [
      { status: 'BOOKING_CREATED', label: 'Booking Created', timestamp: '2026-08-26 10:15 AM', done: true },
      { status: 'QUOTE_APPROVED', label: 'Quote Approved', timestamp: '2026-08-26 10:45 AM', done: true },
      { status: 'PAYMENT_COMPLETED', label: 'Payment Completed (₹9,128)', timestamp: '2026-08-26 11:00 AM', done: true },
      { status: 'TEAM_ASSIGNED', label: 'Team Assigned (Alpha Unit)', timestamp: '2026-08-26 02:00 PM', done: true },
      { status: 'PACKING_COMPLETED', label: 'Packing Completed', timestamp: '2026-08-27 10:30 AM', done: true },
      { status: 'TRANSIT', label: 'In Transit to Kondapur', timestamp: '2026-08-27 11:15 AM', done: true },
      { status: 'DELIVERED', label: 'Delivered & Unpacked', timestamp: 'Pending', done: false }
    ],
    createdAt: '2026-08-26T10:15:00'
  },
  {
    id: 'ANP-PM-8922',
    bookingId: 'ANP-PM-8922',
    customer: { name: 'Pooja Hegde', phone: '9700812345', email: 'pooja.h@yahoo.com' },
    serviceType: 'between-cities',
    serviceTypeName: 'Inter-City Relocation (Hyderabad ➔ Bangalore)',
    sourceCity: 'Hyderabad',
    destCity: 'Bangalore',
    pickup: { address: 'Apt 201, Jubilee Heights, Jubilee Hills, Hyderabad', floor: 2, hasLift: true, parkingDistanceM: 15, contactPhone: '9700812345' },
    drop: { address: 'House 45, Indiranagar 100ft Road, Bangalore', floor: 1, hasLift: true, parkingDistanceM: 10, contactPhone: '9700812345' },
    moveDate: '2026-08-28',
    timeSlot: '07:00 AM – 09:00 AM',
    itemsCount: 38,
    itemsList: [
      { name: 'Complete 3BHK Household Furniture & Appliances', qty: 1, packing: true, dismantling: true }
    ],
    packingType: 'Premium Multi-layer Packing',
    vehicle: { id: 'pm-17ft', name: '17 FT Container Truck', number: 'AP 29 TV 8901' },
    labour: { workers: 5, label: '5 Movers & Helpers' },
    team: { id: 'team-104', name: 'Express Interstate Team', leaderName: 'Venkatesh Rao', phone: '9440123987', rating: 4.9 },
    driver: { name: 'Narsimha Yadav', phone: '9885544332' },
    pricing: { baseFare: 16500, distanceKm: 570, distanceFare: 3500, packingCharge: 2400, labourCharge: 3000, floorHandling: 0, dismantlingCharge: 1200, discount: 1000, gst: 4608, totalAmount: 30208, paidAmount: 10000, pendingAmount: 20208 },
    paymentStatus: 'PARTIALLY_PAID',
    paymentMethod: 'Advance Online + Balance Delivery',
    status: 'CONFIRMED',
    timeline: [
      { status: 'BOOKING_CREATED', label: 'Booking Created', timestamp: '2026-08-25 04:30 PM', done: true },
      { status: 'QUOTE_APPROVED', label: 'Quote Approved', timestamp: '2026-08-25 06:10 PM', done: true },
      { status: 'ADVANCE_PAID', label: 'Advance Paid (₹10,000)', timestamp: '2026-08-25 06:30 PM', done: true },
      { status: 'CONFIRMED', label: 'Slot Confirmed for 28th Aug', timestamp: '2026-08-26 09:00 AM', done: true }
    ],
    createdAt: '2026-08-25T16:30:00'
  },
  {
    id: 'ANP-PM-8923',
    bookingId: 'ANP-PM-8923',
    customer: { name: 'Vikram Sethi', phone: '9988776655', email: 'vikram.sethi@techcorp.in' },
    serviceType: 'office-shifting',
    serviceTypeName: 'Office Relocation (15 Workstations)',
    sourceCity: 'Hyderabad',
    destCity: 'Hyderabad',
    pickup: { address: '4th Floor, Mindspace IT Park, Madhapur, Hyderabad', floor: 4, hasLift: true, parkingDistanceM: 30, contactPhone: '9988776655' },
    drop: { address: '2nd Floor, Financial District, Nanakramguda, Hyderabad', floor: 2, hasLift: true, parkingDistanceM: 20, contactPhone: '9988776655' },
    moveDate: '2026-08-29',
    timeSlot: '02:00 PM – 04:00 PM',
    itemsCount: 45,
    itemsList: [
      { name: 'Modular Workstation Desks', qty: 15, packing: true, dismantling: true },
      { name: 'Ergonomic Office Chairs', qty: 15, packing: true, dismantling: false },
      { name: 'Desktop Monitors & PCs', qty: 15, packing: true, dismantling: false }
    ],
    packingType: 'Premium Multi-layer Packing',
    vehicle: { id: 'pm-20ft', name: '20 FT Heavy Truck', number: 'Unassigned' },
    labour: { workers: 6, label: '6 Professional Moving Crew' },
    team: null,
    driver: null,
    pricing: { baseFare: 6500, distanceKm: 8, distanceFare: 336, packingCharge: 3600, labourCharge: 3600, floorHandling: 0, dismantlingCharge: 2500, discount: 0, gst: 2976, totalAmount: 19512, paidAmount: 0, pendingAmount: 19512 },
    paymentStatus: 'QUOTE_PENDING',
    paymentMethod: 'Corporate Invoice',
    status: 'QUOTE_PENDING',
    timeline: [
      { status: 'REQUEST_RECEIVED', label: 'Quote Request Submitted by Customer', timestamp: '2026-08-26 03:20 PM', done: true },
      { status: 'ADMIN_REVIEW', label: 'Awaiting Admin Estimate Verification', timestamp: 'In Progress', done: false }
    ],
    createdAt: '2026-08-26T15:20:00'
  }
];

const INITIAL_TEAMS = [
  { id: 'team-101', name: 'Alpha Movers Unit', leaderName: 'Suresh Kumar', phone: '9876543210', workersCount: 4, rating: 4.8, completedMoves: 142, currentCity: 'Hyderabad', currentLocality: 'Gachibowli', isAvailable: false, activeBookingId: 'ANP-PM-8921' },
  { id: 'team-102', name: 'Falcon Fast Shifters', leaderName: 'Kishore Varma', phone: '9848112233', workersCount: 4, rating: 4.9, completedMoves: 210, currentCity: 'Hyderabad', currentLocality: 'Madhapur', isAvailable: true, activeBookingId: null },
  { id: 'team-103', name: 'Royal City Packers', leaderName: 'M. Anand', phone: '9177889900', workersCount: 3, rating: 4.7, completedMoves: 98, currentCity: 'Hyderabad', currentLocality: 'Kukatpally', isAvailable: true, activeBookingId: null },
  { id: 'team-104', name: 'Express Interstate Team', leaderName: 'Venkatesh Rao', phone: '9440123987', workersCount: 5, rating: 4.9, completedMoves: 320, currentCity: 'Hyderabad', currentLocality: 'Jubilee Hills', isAvailable: false, activeBookingId: 'ANP-PM-8922' }
];

const INITIAL_COMPLAINTS = [
  { id: 'CMP-701', bookingId: 'ANP-PM-8890', customerName: 'Deepak Verma', phone: '9811223344', issueType: 'Damaged Item', description: 'Scratch on dining table corner during unloading', priority: 'HIGH', status: 'OPEN', teamId: 'team-103', createdAt: '2026-08-25', compensationRequested: 1500, resolutionNotes: '' },
  { id: 'CMP-702', bookingId: 'ANP-PM-8845', customerName: 'Sunita Reddy', phone: '9900112233', issueType: 'Late Delivery', description: 'Truck arrived 2 hours after scheduled slot', priority: 'MEDIUM', status: 'RESOLVED', teamId: 'team-101', createdAt: '2026-08-22', compensationRequested: 500, resolutionNotes: '₹500 refunded to wallet as convenience apology.' }
];

const INITIAL_APP_SETTINGS = {
  enablePackersMovers: true,
  enableWithinCity: true,
  enableBetweenCities: true,
  allowCustomerCustomItems: true,
  allowPhotoUpload: true,
  allowVideoUpload: true,
  enableOnlinePayment: true,
  enableCashOnDelivery: true,
  enablePartialAdvancePayment: true,
  partialAdvancePercentage: 30,
  enableCoupons: true,
  enableRescheduling: true,
  maxRescheduleWindowHours: 24,
  maxReschedulesAllowed: 2,
  rescheduleFee: 300,
  cancellationBeforeAssignmentFee: 0,
  cancellationAfterAssignmentFee: 300,
  cancellationAfterArrivalFee: 600,
  cancellationAfterPackingFee: 1500
};

export const PackersMoversProvider = ({ children }) => {
  const { authFetch } = useContext(AppStateContext);

  // Core State
  const [serviceTypes, setServiceTypes] = useState(() => {
    const saved = localStorage.getItem('porter_pm_service_types');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_TYPES;
  });

  const [withinCityAreas, setWithinCityAreas] = useState(() => {
    const saved = localStorage.getItem('porter_pm_within_city_areas');
    return saved ? JSON.parse(saved) : INITIAL_WITHIN_CITY_AREAS;
  });

  const [intercityRoutes, setIntercityRoutes] = useState(() => {
    const saved = localStorage.getItem('porter_pm_intercity_routes');
    return saved ? JSON.parse(saved) : INITIAL_INTERCITY_ROUTES;
  });

  const [timeSlots, setTimeSlots] = useState(() => {
    const saved = localStorage.getItem('porter_pm_time_slots');
    return saved ? JSON.parse(saved) : INITIAL_TIME_SLOTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('porter_pm_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('porter_pm_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [packingServices, setPackingServices] = useState(() => {
    const saved = localStorage.getItem('porter_pm_packing_services');
    return saved ? JSON.parse(saved) : INITIAL_PACKING_SERVICES;
  });

  const [ambientServices, setAmbientServices] = useState(() => {
    const saved = localStorage.getItem('porter_pm_ambient_services');
    return saved ? JSON.parse(saved) : INITIAL_ADDITIONAL_SERVICES;
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('porter_pm_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [labourTiers, setLabourTiers] = useState(() => {
    const saved = localStorage.getItem('porter_pm_labour_tiers');
    return saved ? JSON.parse(saved) : INITIAL_LABOUR_TIERS;
  });

  const [pricingRules, setPricingRules] = useState(() => {
    const saved = localStorage.getItem('porter_pm_pricing_rules');
    return saved ? JSON.parse(saved) : INITIAL_PRICING_RULES;
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('porter_pm_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('porter_pm_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('porter_pm_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('porter_pm_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('porter_pm_app_settings');
    return saved ? JSON.parse(saved) : INITIAL_APP_SETTINGS;
  });

  // Local Storage Sync Effects
  useEffect(() => { localStorage.setItem('porter_pm_service_types', JSON.stringify(serviceTypes)); }, [serviceTypes]);
  useEffect(() => { localStorage.setItem('porter_pm_within_city_areas', JSON.stringify(withinCityAreas)); }, [withinCityAreas]);
  useEffect(() => { localStorage.setItem('porter_pm_intercity_routes', JSON.stringify(intercityRoutes)); }, [intercityRoutes]);
  useEffect(() => { localStorage.setItem('porter_pm_time_slots', JSON.stringify(timeSlots)); }, [timeSlots]);
  useEffect(() => { localStorage.setItem('porter_pm_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('porter_pm_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('porter_pm_packing_services', JSON.stringify(packingServices)); }, [packingServices]);
  useEffect(() => { localStorage.setItem('porter_pm_ambient_services', JSON.stringify(ambientServices)); }, [ambientServices]);
  useEffect(() => { localStorage.setItem('porter_pm_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('porter_pm_labour_tiers', JSON.stringify(labourTiers)); }, [labourTiers]);
  useEffect(() => { localStorage.setItem('porter_pm_pricing_rules', JSON.stringify(pricingRules)); }, [pricingRules]);
  useEffect(() => { localStorage.setItem('porter_pm_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('porter_pm_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('porter_pm_teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('porter_pm_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('porter_pm_app_settings', JSON.stringify(appSettings)); }, [appSettings]);

  // CRUD Actions
  const updateServiceType = (id, updates) => setServiceTypes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const addServiceType = (newService) => setServiceTypes(prev => [...prev, { ...newService, id: `pm-srv-${Date.now()}` }]);
  const deleteServiceType = (id) => setServiceTypes(prev => prev.filter(s => s.id !== id));

  const addWithinCityArea = (area) => setWithinCityAreas(prev => [...prev, { ...area, id: `area-${Date.now()}` }]);
  const updateWithinCityArea = (id, updates) => setWithinCityAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const deleteWithinCityArea = (id) => setWithinCityAreas(prev => prev.filter(a => a.id !== id));

  const addIntercityRoute = (route) => setIntercityRoutes(prev => [...prev, { ...route, id: `route-${Date.now()}` }]);
  const updateIntercityRoute = (id, updates) => setIntercityRoutes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  const deleteIntercityRoute = (id) => setIntercityRoutes(prev => prev.filter(r => r.id !== id));

  const addTimeSlot = (slot) => setTimeSlots(prev => [...prev, { ...slot, id: `slot-${Date.now()}`, currentBookings: 0 }]);
  const updateTimeSlot = (id, updates) => setTimeSlots(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTimeSlot = (id) => setTimeSlots(prev => prev.filter(t => t.id !== id));

  const addCategory = (cat) => setCategories(prev => [...prev, { ...cat, id: `cat-${Date.now()}` }]);
  const updateCategory = (id, updates) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

  const addItem = (item) => setItems(prev => [...prev, { ...item, id: `item-${Date.now()}` }]);
  const updateItem = (id, updates) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updatePackingService = (id, updates) => setPackingServices(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const updateAmbientServices = (updates) => setAmbientServices(prev => ({ ...prev, ...updates }));

  const addVehicle = (v) => setVehicles(prev => [...prev, { ...v, id: `pm-veh-${Date.now()}` }]);
  const updateVehicle = (id, updates) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  const deleteVehicle = (id) => setVehicles(prev => prev.filter(v => v.id !== id));

  const updateLabourTier = (id, updates) => setLabourTiers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

  const addCoupon = (cpn) => setCoupons(prev => [...prev, { ...cpn, id: `cpn-${Date.now()}`, usedCount: 0 }]);
  const updateCoupon = (id, updates) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCoupon = (id) => setCoupons(prev => prev.filter(c => c.id !== id));

  const updateBookingStatus = (bookingId, newStatus, extraNote) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId || b.bookingId === bookingId) {
        const updatedTimeline = [...b.timeline, {
          status: newStatus,
          label: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
          timestamp: new Date().toLocaleString(),
          done: true
        }];
        return { ...b, status: newStatus, timeline: updatedTimeline };
      }
      return b;
    }));
  };

  const assignTeamToBooking = (bookingId, teamId, vehicleNumber, driverName, driverPhone) => {
    const assignedTeam = teams.find(t => t.id === teamId);
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId || b.bookingId === bookingId) {
        return {
          ...b,
          team: assignedTeam || b.team,
          vehicle: { ...b.vehicle, number: vehicleNumber || b.vehicle.number },
          driver: { name: driverName || 'Assigned Driver', phone: driverPhone || '9876543210' },
          status: 'TEAM_ASSIGNED'
        };
      }
      return b;
    }));
    // Update team availability
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, isAvailable: false, activeBookingId: bookingId } : t));
  };

  const sendRevisedQuote = (bookingId, updatedPricing) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId || b.bookingId === bookingId) {
        return {
          ...b,
          pricing: { ...b.pricing, ...updatedPricing },
          status: 'AWAITING_PAYMENT'
        };
      }
      return b;
    }));
  };

  const updateComplaintStatus = (id, status, resolutionNotes) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, resolutionNotes: resolutionNotes || c.resolutionNotes } : c));
  };

  const processBookingRefund = (bookingId, refundAmount, reason) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId || b.bookingId === bookingId) {
        return {
          ...b,
          pricing: { ...b.pricing, refundedAmount: refundAmount },
          status: 'REFUNDED',
          refundReason: reason
        };
      }
      return b;
    }));
  };

  return (
    <PackersMoversContext.Provider value={{
      serviceTypes, updateServiceType, addServiceType, deleteServiceType,
      withinCityAreas, addWithinCityArea, updateWithinCityArea, deleteWithinCityArea,
      intercityRoutes, addIntercityRoute, updateIntercityRoute, deleteIntercityRoute,
      timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot,
      categories, addCategory, updateCategory, deleteCategory,
      items, addItem, updateItem, deleteItem,
      packingServices, updatePackingService,
      ambientServices, updateAmbientServices,
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      labourTiers, updateLabourTier,
      pricingRules, setPricingRules,
      coupons, addCoupon, updateCoupon, deleteCoupon,
      bookings, setBookings, updateBookingStatus, assignTeamToBooking, sendRevisedQuote, processBookingRefund,
      teams, setTeams,
      complaints, updateComplaintStatus,
      appSettings, setAppSettings
    }}>
      {children}
    </PackersMoversContext.Provider>
  );
};
