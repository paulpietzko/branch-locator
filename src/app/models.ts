export interface Branch {
  id: number;
  plz: string;
  firma: string;
  ort: string;
  email: string;
  kanton: string;
  website: string;
  opening_hours: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface BranchMapMarker {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  options: {
    animation: google.maps.Animation;
  };
  label: string;
  click: () => void;
}
