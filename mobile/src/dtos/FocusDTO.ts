export type FocusResponseDTO = {
  title: string;
  data: FocusDto[];
};

export type FocusDto = {
  id: number;
  created_at: string;
  filename: string;
  name: string;
  descricao: string;
  concluido?: boolean;
};

export type FocusDetailsDTO = {
  cep: string;
  cidade: string;
  uf: string;
  bairro: string;
  numero: string;
  logradouro: string;
  complemento?: string;
  userPhoto: string;
  userLocal: string;
  concluido?: boolean;
  userWhoFinished?: {
    name: string;
    userPhoto: string;
    userLocal: string;
  };
} & FocusDto;
