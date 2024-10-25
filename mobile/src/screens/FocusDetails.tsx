import { useNavigation, useRoute } from "@react-navigation/native";
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
import { useEffect, useState } from "react";

import CloseSvg from "@assets/close.svg";
import ImageSvg from "@assets/photo.svg";
import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { Button } from "@components/Button";
import { Loading } from "@components/Loading";
import { FocusDetailsDTO } from "@dtos/FocusDTO";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import { Dimensions, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";

const PHOTO_SIZE = 48;

type RouteParamsProps = {
  id: string;
};

export function FocusDetails() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoadingFocusRegister, setIsLoadingFocusRegister] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [photo, setPhoto] = useState('');
  const [focus, setFocus] = useState({} as FocusDetailsDTO);
  const { user } = useAuth()
  const route = useRoute();
  const theme = useTheme()
  const { updateUserPoints } = useAuth();

  const { id } = route.params as RouteParamsProps;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFinishFocus = async () => {
    if (!photo.length) return;

    setIsLoadingFocusRegister(true);

    try {
      await api.put(`/focus/${id}`, { resolutionPhoto: photo });
      toast.show({
        title: "Parabéns! Você ganhou 2 pontos por remover o foco de dengue!",
        bgColor: "green.500",
        placement: "top",
      });
      await updateUserPoints();
      setIsOpenModal(false)
      setPhoto('')
      getFocus();
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : "Não foi possível concluir.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setIsLoadingFocusRegister(false);
    }
  };

  async function getFocus() {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/focus/${id}`);
      setFocus(data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os detalhes do foco.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteFocus() {
    setIsLoadingDelete(true)
    try {
      await api.delete(`/focus/${id}`);
      handleGoBack();
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível excluir os detalhes do foco.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setIsLoadingDelete(false);
    }
  }

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

        userPhotoUploadForm.append("file", photoFile);

        const response = await api.post("/upload", userPhotoUploadForm, {
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

  useEffect(() => {
    getFocus();
  }, [id]);

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
                  Detalhes do foco
                </Heading>
              </HStack>
            </VStack>
            <ScrollView>
              <VStack px={8}>
                <HStack py={2} flex={1} alignItems="center">
                  <Image
                    rounded={'3xl'}
                    source={
                      focus.userPhoto
                        ? {
                          uri: focus.userPhoto,
                        }
                        : defaultUserPhotoImg
                    }
                    defaultSource={defaultUserPhotoImg}
                    alt="Foto do usuario"
                    borderWidth={2}
                    borderColor="gray.400"
                    w={12}
                    h={12}
                  />
                  <VStack pl={4}>
                    <Text color="gray.200" fontFamily="heading" numberOfLines={1}>
                      {focus.name}
                    </Text>
                    <Text color="gray.200" fontSize="sm" numberOfLines={1}>
                      Publicado em {moment(focus.createdAt).add(3, 'h').format("DD/MM/YYYY [às] HH:mm")}
                    </Text>
                  </VStack>
                </HStack>
                <Center>
                  <Image
                    w={"full"}
                    h={PHOTO_SIZE}
                    source={{
                      uri: focus.filename,
                    }}
                    rounded={4}
                    alt="Foto do local"
                  />
                </Center>
                <Box pt={2}>
                  <Text color="gray.300" fontSize="sm" fontFamily="heading">
                    Descrição:
                  </Text>
                  <Text color="gray.200" fontSize="sm">
                    {focus.descricao}
                  </Text>
                </Box>

                <Box mt={2} mb={4} h={40} position={'relative'}>
                  <Text color="gray.300" fontSize="sm" fontFamily="heading">
                    Local:
                  </Text>
                  <MapView
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 24,
                      bottom: 0,
                      borderRadius: 4,
                    }}
                    initialRegion={{
                      latitude: focus.coords.latitude,
                      longitude: focus.coords.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker coordinate={focus.coords}></Marker>
                  </MapView>
                </Box>

                {!focus.userWhoFinished ? (
                  <Button
                    isLoading={isLoadingFocusRegister}
                    title="Marcar como resolvido"
                    onPress={() => setIsOpenModal(true)}
                  />
                ) : (
                  <>
                    <Text fontFamily="heading" color="gray.300" fontSize="sm">
                      Resolvido por:
                    </Text>
                    <HStack pt={2} flex={1} alignItems="center">
                      <Image
                        source={
                          focus.userWhoFinished.userPhoto
                            ? {
                              uri: focus.userWhoFinished.userPhoto,
                            }
                            : defaultUserPhotoImg
                        }
                        defaultSource={defaultUserPhotoImg}
                        alt="Foto do usuario"
                        borderWidth={2}
                        borderColor="gray.400"
                        w={12}
                        h={12}
                        rounded="full"
                      />
                      <VStack pl={4}>
                        <Text
                          color="gray.200"
                          fontFamily="heading"
                          numberOfLines={1}
                        >
                          {focus.userWhoFinished.name}
                        </Text>
                        <Text color="gray.200" fontSize="sm" numberOfLines={1}>
                          Resolvido em {moment(focus.updatedAt).add(3, 'h').format("DD/MM/YYYY [às] HH:mm")}
                        </Text>
                      </VStack>
                    </HStack>
                    <Center mt={2} mb={4}>
                      <Image
                        w={"full"}
                        h={PHOTO_SIZE}
                        source={{
                          uri: focus.resolutionPhoto,
                        }}
                        rounded={4}
                        alt="Foto do local"
                      />
                    </Center>
                  </>
                )}

                {!focus.userWhoFinished && focus.user_id === user._id && (
                  <Button
                    isLoading={isLoadingDelete}
                    title="Excluir foco"
                    variant="outline"
                    type="error"
                    onPress={deleteFocus}
                    mt={2}
                  />
                )}
              </VStack>
            </ScrollView>
          </>
        )}
      </VStack>
      <Modal isOpen={isOpenModal}
        shadow={"9"}
        roundedTop={24}
        animationPreset="slide"
        bg={'gray.500'}
        h={Dimensions.get("screen").height / 2 + (photo.length ? Dimensions.get("screen").height / 10 : 0)}
        top={Dimensions.get("screen").height / 2 - (photo.length ? Dimensions.get("screen").height / 10 : 0)}
        overflow={'hidden'}>
        <Box flex={1} w={'full'} pt={4} position={'relative'} >
          <HStack px={4} justifyContent={"space-between"}>
            <Heading fontSize={"lg"} fontFamily={"heading"} color="gray.100">
              Escolher foto
            </Heading>
            <TouchableOpacity onPress={() => setIsOpenModal(false)}>
              <CloseSvg fill={theme.colors.gray[100]} />
            </TouchableOpacity>
          </HStack>
          <Center mt={4} px={4}>
            {photoIsLoading ? (
              <Skeleton
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
                ) : (<ImageSvg onPress={handleUserPhotoSelect} stroke={theme.colors.gray[100]} />)}
              </>
            )}
            <Button mt={4} variant={photo.length ? 'outline' : 'solid'} title={photo.length ? 'Trocar foto' : 'Enviar foto'} onPress={handleUserPhotoSelect} />
            {!!photo.length && <Button mt={4} title="Marcar como resolvido" onPress={handleFinishFocus} />}
          </Center>
        </Box>
      </Modal>
    </>
  );
}
