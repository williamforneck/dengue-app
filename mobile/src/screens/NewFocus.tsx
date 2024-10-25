import CloseSvg from "@assets/close.svg";
import ImageSvg from "@assets/photo.svg";
import { useNavigation } from "@react-navigation/native";
import {
  Box,
  Center,
  HStack,
  Heading,
  Icon,
  Image,
  Modal,
  ScrollView,
  Skeleton,
  Text,
  VStack,
  useTheme,
  useToast,
} from "native-base";
import { useState } from "react";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { Loading } from "@components/Loading";
import { Feather } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@hooks/useAuth";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { Dimensions, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, {
  LatLng,
  Marker,
} from "react-native-maps";
import * as yup from "yup";

type FormDataProps = {
  descricao: string;
};

const focoSchema = yup.object({
  descricao: yup.string().required("Informe uma breve descrição."),
});

const PHOTO_SIZE = 33;

export function NewFocus() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [photo, setPhoto] = useState("");
  const [coords, setCoords] = useState<LatLng>();
  const [openMap, setOpenMap] = useState<boolean>();
  const theme = useTheme()
  const { location } = useAuth()
  const {
    control,
    handleSubmit,
    reset,
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
        console.log("todo: deletar foto atual da base")
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

        userPhotoUploadForm.append("file", photoFile);

        const { data } = await api.post<{ filename: string }>("/upload", userPhotoUploadForm, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setPhoto(data.filename);
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

    if (!coords) {
      toast.show({
        title: "Selecione o local do foco",
        bgColor: "red.500",
        placement: "top",
      });
      return;
    }
    setIsLoading(true);

    const data = {
      ...event,
      filename: photo,
      coords
    };

    try {
      await api.post("/focus", data);
      toast.show({
        title: "Foco cadastrado com sucesso! Você ganhou 1 ponto!",
        bgColor: "green.500",
        placement: "top",
      });
      await updateUserPoints();
      resetData()
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

  const resetData = () => {
    setPhoto('')
    setCoords(undefined)
    reset()
  }

  return (
    <>
      <VStack flex={1}>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <VStack px={8} bg="gray.600" pt={12}>
              <HStack
                justifyContent="space-between"
                mt={4}
                mb={4}
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
                        rounded={'2xl'}
                        w={PHOTO_SIZE}
                        h={PHOTO_SIZE}
                        startColor="gray.500"
                        endColor="gray.400"
                      />
                    ) : (
                      <>
                        {photo.length ? (
                          <Image
                            w={'full'}
                            h={PHOTO_SIZE}
                            rounded={'2xl'}
                            source={{ uri: photo }}
                            alt="Foto do local"
                          />
                        ) : (<ImageSvg width={160} height={160} onPress={handleUserPhotoSelect} stroke={theme.colors.gray[100]} />)}
                      </>
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

                    <TouchableOpacity onPress={() => setOpenMap(true)}>
                      <Text
                        color="green.500"
                        fontFamily="heading"
                        fontSize="md"
                        mt={2}
                        mb={8}
                      >
                        Escolher local
                      </Text>
                    </TouchableOpacity>

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
      <Modal
        shadow={"9"}
        roundedTop={24}
        isOpen={openMap}
        animationPreset="slide"
        bg={'gray.500'}
        h={Dimensions.get("screen").height / 6 * 5}
        top={Dimensions.get("screen").height / 6}
        overflow={'hidden'}>
        <Box flex={1} w={'full'} px={4} pb={12} pt={4} position={'relative'} >
          <HStack flex={1} justifyContent={"space-between"}>
            <Heading fontSize={"lg"} fontFamily={"heading"} color="gray.100">
              Escolher local
            </Heading>
            <TouchableOpacity onPress={() => {
              setOpenMap(false)
              setCoords(undefined)
            }}>
              <CloseSvg fill={theme.colors.gray[100]} />
            </TouchableOpacity>
          </HStack>
          <MapView
            showsUserLocation
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 56,
              bottom: 120,
              borderRadius: 24,
            }}
            onPress={(evt) => setCoords(evt.nativeEvent.coordinate)}
            initialRegion={{
              latitude: location?.coords.latitude ?? -29.8623591788761,
              longitude: location?.coords.longitude ?? -50.62139922629445,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            rotateEnabled={false}
          >
            {coords && <Marker draggable coordinate={coords}></Marker>}
          </MapView>
          <Button onPress={() => setOpenMap(false)} disabled={!coords} title="Confirmar localização" />
        </Box>
      </Modal>
    </>

  );
}
