export enum UserType {
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
  STORE = 'store',
  VETERINARY = 'veterinary',
}

export function isValidUserType(value: any): value is UserType {
  return Object.values(UserType).includes(value);
}