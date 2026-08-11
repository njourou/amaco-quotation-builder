export const MOTOR_MAKES: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Hilux", "Land Cruiser", "Prado", "Fortuner", "Vitz", "Harrier", "Fielder", "Axio", "Probox", "Succeed", "Wish", "Noah", "Voxy", "Alphard", "Hiace"],
  Nissan: ["Note", "X-Trail", "Juke", "Navara", "Patrol", "Serena", "Tiida", "Sylphy", "Wingroad", "Caravan", "NV200"],
  Subaru: ["Forester", "Outback", "Legacy", "Impreza", "XV", "Levorg", "WRX"],
  Mazda: ["Demio", "Axela", "CX-5", "CX-3", "Atenza", "CX-8"],
  Honda: ["Fit", "Vezel", "CR-V", "HR-V", "Civic", "Accord", "Stepwgn", "Freed"],
  Mercedes: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "CLA", "G-Class"],
  BMW: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "1 Series"],
  Volkswagen: ["Golf", "Tiguan", "Touareg", "Polo", "Passat", "T-Cross"],
  Hyundai: ["Tucson", "Santa Fe", "Creta", "Elantra", "Sonata", "i10", "i20"],
  Kia: ["Sportage", "Sorento", "Seltos", "Cerato", "Picanto", "Rio"],
  "Land Rover": ["Defender", "Discovery", "Range Rover", "Range Rover Sport", "Evoque", "Velar"],
  Ford: ["Ranger", "Everest", "EcoSport", "Explorer", "Escape"],
  Mitsubishi: ["Outlander", "Pajero", "L200", "Eclipse Cross", "ASX", "Canter"],
  Suzuki: ["Swift", "Vitara", "Jimny", "Alto", "S-Presso", "Ertiga"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
  Lexus: ["RX", "NX", "LX", "IS", "ES"],
  Isuzu: ["D-Max", "MU-X", "NPR", "NQR", "FRR", "FVR", "FVZ"],
  Porsche: ["Cayenne", "Macan", "Panamera", "911"],
  Jeep: ["Wrangler", "Grand Cherokee", "Compass", "Renegade"],
  Volvo: ["XC40", "XC60", "XC90", "S60", "S90"],
};

export const YEARS = Array.from({ length: 21 }, (_, i) => 2026 - i);
