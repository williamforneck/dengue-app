import { FlatList, Text, VStack, useToast } from "native-base";
import { useCallback, useState } from "react";

import { Loading } from "@components/Loading";
import { RankCard } from "@components/RankCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { RankDTO } from "@dtos/RankDTO";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

export function Rank() {
  const [ranks, setRanks] = useState<RankDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  async function getRank() {
    try {
      setIsLoading(true);
      const { data } = await api.get("/rank");
      setRanks(data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar o placar de líderes.";

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getRank();
    }, [])
  );

  return (
    <VStack flex={1}>
      <ScreenHeader title="Pessoas que mais ajudaram" />
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={ranks}
          keyExtractor={(item) => String(item._id)}
          renderItem={({ item, index }) => (
            <RankCard
              data={item}
              position={index + 1}
              mb={index === ranks.length - 1 ? 6 : 3}
            />
          )}
          ListEmptyComponent={
            <Text color="gray.100" textAlign="center">
              Não há líderes cadastrados ainda. {"\n"} Complete as atividades e
              seja o primeiro!
            </Text>
          }
          contentContainerStyle={
            !ranks.length && { flex: 1, justifyContent: "center" }
          }
          px={8}
          pt={3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </VStack>
  );
}
