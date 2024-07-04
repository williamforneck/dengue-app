import {
  HStack,
  Heading,
  SectionList,
  Text,
  VStack,
  useToast,
} from "native-base";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { AppError } from "@utils/AppError";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { FocusCard } from "@components/FocusCard";
import { FocusResponseDTO } from "@dtos/FocusDTO";
import { HomeHeader } from "@components/HomeHeader";
import { Loading } from "@components/Loading";
import { api } from "@services/api";
import { Button } from "@components/Button";

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [focus, setFocus] = useState<FocusResponseDTO[]>([]);
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const totalItems = focus.reduce(
    (acc, value) => (acc += value.data.length),
    0
  );

  const toast = useToast();

  const handleOpenExerciseDetails = () => {
    navigation.navigate("addFocus");
  };

  async function getFocus() {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/focus`);
      setFocus(data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os focos.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const goToDetails = (id: number) => {
    navigation.navigate("focusDetails", { id });
  };

  useFocusEffect(
    useCallback(() => {
      getFocus();
    }, [])
  );
  return (
    <VStack flex={1}>
      <HomeHeader />
      <VStack px={8} my={8}>
        <Button onPress={handleOpenExerciseDetails} title="Adicionar foco" />
      </VStack>

      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1} px={8}>
          <HStack justifyContent="space-between" mb={5}>
            <Heading color="gray.200" fontSize="md" fontFamily="heading">
              Focos de dengue
            </Heading>
            <Text color="gray.200" fontSize="sm">
              {totalItems}
            </Text>
          </HStack>
          <SectionList
            sections={focus}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <FocusCard onPress={() => goToDetails(item.id)} data={item} />
            )}
            renderSectionHeader={({ section }) => (
              <Heading
                fontFamily="heading"
                color="gray.200"
                fontSize="md"
                mb={3}
                textAlign={"center"}
              >
                {section.title}
              </Heading>
            )}
            paddingBottom={20}
            showsVerticalScrollIndicator={false}
          />
        </VStack>
      )}
    </VStack>
  );
}
