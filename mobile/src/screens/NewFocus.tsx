import {
  HStack,
  Heading,
  Icon,
  Image,
  Skeleton,
  ScrollView,
  Text,
  VStack,
  useToast,
  Center,
} from "native-base";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { AppError } from "@utils/AppError";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { Button } from "@components/Button";
import { Feather } from "@expo/vector-icons";
import { Loading } from "@components/Loading";
import { Platform, TouchableOpacity } from "react-native";
import { api } from "@services/api";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@components/Input";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@hooks/useAuth";
import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type FormDataProps = {
  descricao: string;
  cep: string;
  cidade: string;
  uf: string;
  logradouro: string;
  bairro: string;
  numero: string;
  complemento?: string;
};

const focoSchema = yup.object({
  cep: yup
    .string()
    .required("Informe o cep.")
    .min(8, "O CEP deve ter 8 dígitos.")
    .max(8, "O CEP deve ter 8 dígitos."),
  descricao: yup.string().required("Informe uma breve descrição."),
  cidade: yup.string().required("Informe a cidade."),
  uf: yup.string().required("Informe a UF."),
  logradouro: yup.string().required("Informe o logradouro."),
  bairro: yup.string().required("Informe o bairro."),
  numero: yup.string().required("Informe o numero."),
  complemento: yup.string(),
});

const PHOTO_SIZE = 33;

export function NewFocus() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [photo, setPhoto] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(focoSchema),
  });
  const { user, updateUserPoints } = useAuth();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleUserPhotoSelect = async () => {
    setPhotoIsLoading(true);
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri
        );

        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: "Essa imagem é muito grande. Escolha uma de até 5MB",
            placement: "top",
            bgColor: "red.500",
          });
        }
        const fileExtension = photoSelected.assets[0].uri.split(".").pop();
        const photoFile = {
          name: `${user.name}.${fileExtension}`,
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;

        const userPhotoUploadForm = new FormData();

        userPhotoUploadForm.append("imagem", photoFile);

        const response = await api.post("/uploads", userPhotoUploadForm, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setPhoto(response.data.filename);
      }
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar a foto.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setPhotoIsLoading(false);
    }
  };

  const handleCreateFocus = async (event: FormDataProps) => {
    if (!photo) {
      toast.show({
        title: "Adicione uma foto do local",
        bgColor: "red.500",
        placement: "top",
      });
      return;
    }
    setIsLoading(true);

    const data = {
      ...event,
      filename: photo,
    };

    try {
      await api.put("/focus", data);
      toast.show({
        title: "Foco cadastrado com sucesso! Você ganhou 1 ponto!",
        bgColor: "green.500",
        placement: "top",
      });
      await updateUserPoints();
      handleGoBack();
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : "Não foi possível cadastrar.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack flex={1}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <VStack px={8} bg="gray.600" pt={12}>
            <HStack
              justifyContent="space-between"
              mt={4}
              mb={8}
              alignItems="center"
            >
              <TouchableOpacity onPress={handleGoBack}>
                <Icon
                  as={Feather}
                  name="arrow-left"
                  color="green.500"
                  size={6}
                />
              </TouchableOpacity>
              <Heading
                color="gray.100"
                fontSize="lg"
                flexShrink={1}
                fontFamily="heading"
              >
                Adicionar foco
              </Heading>
            </HStack>
          </VStack>
          <KeyboardAwareScrollView
            enableAutomaticScroll
            keyboardOpeningTime={0}
            viewIsInsideTabBar
            extraHeight={Platform.select({ ios: 180 })}
          >
            <ScrollView>
              <VStack p={8}>
                <Center>
                  {photoIsLoading ? (
                    <Skeleton
                      w={PHOTO_SIZE}
                      h={PHOTO_SIZE}
                      startColor="gray.500"
                      endColor="gray.400"
                    />
                  ) : (
                    <Image
                      w={PHOTO_SIZE}
                      h={PHOTO_SIZE}
                      borderWidth={2}
                      borderColor="gray.400"
                      source={
                        photo.length
                          ? {
                              uri: `${api.defaults.baseURL}/avatar/${photo}`,
                            }
                          : defaultUserPhotoImg
                      }
                      alt="Foto do local"
                    />
                  )}
                  <TouchableOpacity onPress={handleUserPhotoSelect}>
                    <Text
                      color="green.500"
                      fontFamily="heading"
                      fontSize="md"
                      mt={2}
                      mb={8}
                    >
                      Enviar foto
                    </Text>
                  </TouchableOpacity>

                  <Controller
                    control={control}
                    name="descricao"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="Descrição"
                        errorMessage={errors.descricao?.message}
                      />
                    )}
                  />
                  <Heading
                    color="gray.100"
                    fontSize="xl"
                    fontFamily="heading"
                    mb={6}
                  >
                    Endereço:
                  </Heading>
                  <Controller
                    control={control}
                    name="cep"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="CEP"
                        errorMessage={errors.cep?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="cidade"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="Cidade"
                        errorMessage={errors.cidade?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="uf"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="UF"
                        errorMessage={errors.uf?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="bairro"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="Bairro"
                        errorMessage={errors.bairro?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="logradouro"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="Logradouro"
                        errorMessage={errors.logradouro?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="numero"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="Número"
                        errorMessage={errors.numero?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="complemento"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChangeText={onChange}
                        value={value}
                        placeholder="Complemento"
                        errorMessage={errors.complemento?.message}
                      />
                    )}
                  />
                  <Button
                    title="Cadastrar"
                    isLoading={isLoading}
                    onPress={handleSubmit(handleCreateFocus)}
                  />
                </Center>
              </VStack>
            </ScrollView>
          </KeyboardAwareScrollView>
        </>
      )}
    </VStack>
  );
}
