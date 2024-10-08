export interface Branch {
  id?: string;
  postCode: string;
  name: string;
  location: string;
  email: string;
  canton: string;
  website: string;
  openingHours: string;
  phone: string;
  lat: number;
  lng: number;
  imagePath?: string;
}

export interface BranchMapMarker {
  branch: Branch;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  options: {
    animation: google.maps.Animation;
  };
  label: string;
  click?: () => void;
}

export interface MetaTag {
  title: string;
  description: string;
}

export enum FileFormat {
  Excel = 'excel',
  Pdf = 'pdf',
  Json = 'json',
  Csv = 'csv',
}