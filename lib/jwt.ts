import jwt from "jsonwebtoken";

//
const SECRET = process.env.JWT_SECRET!;
// console.log("Secret : ", SECRET);

export function signToken(payload: { id: string; role: string }) {
  ////console.log("Running signToken")
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string) {
  try {
    const cleanToken = token.replace(/^"|"$/g, '');
    return jwt.verify(cleanToken, SECRET) as { id: string; role: string };
  } catch (error: any) {
    console.log("JWT Verification Error:", error.message);
    return null;
  }
}
