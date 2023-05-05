import jwt from "npm:jsonwebtoken@9.0.0";
import { load } from "https://deno.land/std@0.186.0/dotenv/mod.ts";
const env = await load();

export const signJwt = async ({
  id,
  email,
}: {
  email: string;
  id: number;
}): Promise<string> => {
  return await jwt.sign(
    {
      id,
      email,
    },
    env.JWT_TOKEN_SECRETE
  );
};

export const verifyJwt = async (token: string) => {
  return (await jwt.verify(token, env.JWT_TOKEN_SECRETE)) as {
    email: string;
    id: number;
  };
};
