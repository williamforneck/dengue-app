import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  HStack,
  Heading,
  Text,
  VStack,
  useToast
} from "native-base";
import { useCallback, useEffect, useRef, useState } from "react";

import focoImg from "@assets/foco.png";
import focoCheckImg from "@assets/foco_check.png";
import { Button } from "@components/Button";
import { HomeHeader } from "@components/HomeHeader";
import { Loading } from "@components/Loading";
import { FocusDto } from "@dtos/FocusDTO";
import { useAuth } from "@hooks/useAuth";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import MapView, { Marker } from "react-native-maps";

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [focus, setFocus] = useState<FocusDto[]>([]);
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const { location } = useAuth()
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (location && mapRef) {
      mapRef.current?.animateCamera(
        { center: location.coords, altitude: 700, zoom: 18 },
        { duration: 800 },
      );
    }
  }, [location])

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

  const goToDetails = (id: string) => {
    navigation.navigate("focusDetails", { id });
  };

  useFocusEffect(
    useCallback(() => {
      getFocus();
    }, [])
  );

  const openFoco = (foco: FocusDto) => {
    goToDetails(foco._id)
  }

  return (
    <VStack flex={1}>
      <HomeHeader />
      <VStack px={4} my={4}>
        <Button onPress={handleOpenExerciseDetails} title="Adicionar foco" />
      </VStack>

      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1} px={4}>
          <HStack justifyContent="space-between" mb={5}>
            <Heading color="gray.200" fontSize="md" fontFamily="heading">
              Focos de dengue
            </Heading>
            <Text color="gray.200" fontSize="sm">
              {focus.length}
            </Text>
          </HStack>
          <MapView
            showsUserLocation
            ref={mapRef}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 32,
              bottom: 12,
              borderRadius: 24,
            }}
            initialRegion={{
              latitude: location?.coords.latitude ?? -29.8623591788761,
              longitude: location?.coords.longitude ?? -50.62139922629445,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            rotateEnabled={false}
          >
            {focus.map((f, i) => <Marker onPress={() => openFoco(f)} image={f.concluido ? focoCheckImg : focoImg} key={i} coordinate={f.coords}></Marker>)}
          </MapView>
        </VStack>
      )}
    </VStack>
  );
}
