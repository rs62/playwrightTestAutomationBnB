// Interface for different data elements used for type checking
export interface roomInterface {
  number: string;
  type: string;
  accessiblity: boolean;
  price: string;
  features: string[];
  description?: string;
  image?: string;
}

export interface bookingInterface {
  roomid?: string;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  price?: string;
  depositpaid?: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
}

export interface contactInterface {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
