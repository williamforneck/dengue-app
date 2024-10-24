import { LatLng } from "react-native-maps";

export type FocusDto = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  filename: string;
  name: string;
  descricao: string;
  coords: LatLng;
  concluido?: boolean;
};

export type FocusDetailsDTO = {
  user_id: string;
  userPhoto: string;
  resolutionPhoto: string;
  userWhoFinished?: {
    name: string;
    userPhoto: string;
    userLocal: string;
  };
} & FocusDto;
