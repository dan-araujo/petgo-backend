export enum UserType {
  CUSTOMER = 'CUSTOMER',
  DELIVERY = 'DELIVERY',
  STORE = 'STORE',
  VETERINARY = 'VETERINARY',
}

export function isValidUserType(value: any): value is UserType {
  return Object.values(UserType).includes(value);
}