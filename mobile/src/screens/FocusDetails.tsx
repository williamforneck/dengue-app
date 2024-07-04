import {
  HStack,
  Heading,
  Icon,
  Image,
  ScrollView,
  VStack,
  useToast,
  Center,
  Text,
  Box,
} from "native-base";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppError } from "@utils/AppError";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { Feather } from "@expo/vector-icons";
import { Loading } from "@components/Loading";
import { TouchableOpacity } from "react-native";
import { api } from "@services/api";
import { FocusDetailsDTO } from "@dtos/FocusDTO";
import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { Button } from "@components/Button";
import { useAuth } from "@hooks/useAuth";

const PHOTO_SIZE = 56;

type RouteParamsProps = {
  id: string;
};

export function FocusDetails() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFocusRegister, setIsLoadingFocusRegister] = useState(false);
  const [focus, setFocus] = useState({} as FocusDetailsDTO);

  const route = useRoute();
  const { updateUserPoints } = useAuth();

  const { id } = route.params as RouteParamsProps;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFinishFocus = async () => {
    setIsLoadingFocusRegister(true);

    try {
      await api.put(`/focus/${id}`);
      toast.show({
        title: "Parabéns! Você ganhou 2 pontos por remover o foco de dengue!",
        bgColor: "green.500",
        placement: "top",
      });
      await updateUserPoints();
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

  useEffect(() => {
    getFocus();
  }, [id]);

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
            <VStack p={8}>
              <Center>
                <Image
                  w={"full"}
                  h={PHOTO_SIZE}
                  borderWidth={2}
                  borderColor="gray.400"
                  source={{
                    uri: `${api.defaults.baseURL}/avatar/${focus.filename}`,
                  }}
                  alt="Foto do local"
                />
              </Center>
              <Box pt={4}>
                <Text color="gray.300" fontSize="sm" fontFamily="heading">
                  Descrição:{" "}
                </Text>
                <Text color="gray.200" fontSize="sm">
                  {focus.descricao}
                </Text>
              </Box>
              <Box pt={4}>
                <Text color="gray.300" fontSize="sm" fontFamily="heading">
                  Publicado por:
                </Text>
              </Box>
              <HStack pt={2} flex={1} alignItems="center">
                <Image
                  source={
                    focus.userPhoto
                      ? {
                          uri: `${api.defaults.baseURL}/avatar/${focus.userPhoto}`,
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
                  <Text color="gray.200" fontFamily="heading" numberOfLines={1}>
                    {focus.name}
                  </Text>
                  <Text color="gray.200" fontSize="sm" numberOfLines={1}>
                    {focus.userLocal}
                  </Text>
                </VStack>
              </HStack>
              <Box pt={4}>
                <Text color="gray.300" fontSize="sm" fontFamily="heading">
                  Data e hora:
                </Text>
                <Text color="gray.200" fontSize="sm">
                  {focus.created_at}
                </Text>
              </Box>
              <Box py={4}>
                <Text color="gray.300" fontSize="sm" fontFamily="heading">
                  Endereço:
                </Text>
                <Text color="gray.200" fontSize="sm">
                  {focus.cep} {focus.cidade} - {focus.uf}
                </Text>
                <Text color="gray.200" fontSize="sm">
                  {focus.bairro}, {focus.logradouro}, {focus.numero}
                </Text>
                <Text color="gray.200" fontSize="sm">
                  {focus.complemento}
                </Text>
              </Box>
              {!focus.userWhoFinished ? (
                <Button
                  isLoading={isLoadingFocusRegister}
                  title="Marcar como resolvido"
                  onPress={handleFinishFocus}
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
                              uri: `${api.defaults.baseURL}/avatar/${focus.userWhoFinished.userPhoto}`,
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
                        {focus.userWhoFinished.userLocal}
                      </Text>
                    </VStack>
                  </HStack>
                </>
              )}
            </VStack>
          </ScrollView>
        </>
      )}
    </VStack>
  );
}
