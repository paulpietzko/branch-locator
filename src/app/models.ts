export interface Branch {
  id?: string;
  plz: string;
  firma: string;
  ort: string;
  email: string;
  kanton: string;
  website: string;
  openingHours: string;
  phone: string;
  lat: number;
  lng: number;
  imageUrl?: string; 
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
