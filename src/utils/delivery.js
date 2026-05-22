export const DELIVERY_ZONES = [
  { id: 'kiambu', label: 'Kiambu Local (Kiambu Town, Kikuyu, Wangige, Ruaka)', fee: 0 },
  { id: 'nairobi', label: 'Nairobi Metro (CBD, Westlands, Eastlands, etc)', fee: 150 },
  { id: 'rest_of_kenya', label: 'Rest of Kenya (via G4S / Kentax Cargo)', fee: 350 },
];

export const getDeliveryFee = (zoneId) => {
  const zone = DELIVERY_ZONES.find(z => z.id === zoneId);
  return zone ? zone.fee : 0;
};
