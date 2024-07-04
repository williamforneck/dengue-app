import * as yup from "yup";

import {
  Center,
  HStack,
  Heading,
  Image,
  ScrollView,
  Text,
  VStack,
  useToast,
} from "native-base";
import { Controller, useForm } from "react-hook-form";

import { AppError } from "@utils/AppError";
import BackgroundImage from "@assets/background1.png";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import LogoSvg from "@assets/logo.svg";
import { api } from "@services/api";
import { useAuth } from "@hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

type FormDataProps = {
  name: string;
  email: string;
  cep: string;
  cidade: string;
  uf: string;
  logradouro: string;
  bairro: string;
  numero: string;
  complemento?: string;
  password: string;
  password_confirm: string;
};

const signUpSchema = yup.object({
  name: yup.string().required("Informe o nome."),
  email: yup.string().required("Informe o e-mail.").email("E-mail inválido."),
  cep: yup
    .string()
    .required("Informe o cep.")
    .min(8, "O CEP deve ter 8 dígitos.")
    .max(8, "O CEP deve ter 8 dígitos."),
  cidade: yup.string().required("Informe a cidade."),
  uf: yup.string().required("Informe a UF."),
  logradouro: yup.string().required("Informe o logradouro."),
  bairro: yup.string().required("Informe o bairro."),
  numero: yup.string().required("Informe o numero."),
  complemento: yup.string(),
  password: yup
    .string()
    .required("Informe a senha.")
    .min(6, "A senha deve ter pelo menos 6 dígitos."),
  password_confirm: yup
    .string()
    .required("Confirme a senha.")
    .oneOf([yup.ref("password")], "A confirmação da senha não confere."),
});

export function SignUp() {
  const [isLoadingCreateUser, setIsLoadingCreateUser] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const { signIn } = useAuth();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema),
  });

  const handleSignUp = async (data: FormDataProps) => {
    try {
      setIsLoadingCreateUser(true);
      await api.post("/users", data);
      await signIn(data.email, data.password);
    } catch (error) {
      console.log(error);
      setIsLoadingCreateUser(false);
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível criar a conta, tente novamente.";
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackgroundImage}
          defaultSource={BackgroundImage}
          alt="Mosquito da dengue"
          resizeMode="contain"
          position="absolute"
        />
        <Center my={24} mb={4}>
          <HStack alignItems={"center"}>
            <LogoSvg width={40} color={"#00875F"} />
            <Heading ml={4} color="gray.100" fontSize={24} fontFamily="heading">
              Caça Dengue
            </Heading>
          </HStack>
          <Text color="gray.100" fontSize="sm">
            Unidos contra a dengue
          </Text>
        </Center>
        <Center>
          <Heading color="gray.100" fontSize="xl" fontFamily="heading" mb={6}>
            Crie sua conta
          </Heading>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                onChangeText={onChange}
                value={value}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirme a senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            )}
          />
          <Heading color="gray.100" fontSize="xl" fontFamily="heading" mb={6}>
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
            title="Criar e acessar"
            onPress={handleSubmit(handleSignUp)}
            isLoading={isLoadingCreateUser}
          />
        </Center>
        <Button
          onPress={handleGoBack}
          mt={12}
          title="Voltar para login"
          variant="outline"
        />
      </VStack>
    </ScrollView>
  );
}
