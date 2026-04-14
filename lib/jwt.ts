import jwt from "jsonwebtoken";

//
const SECRET = process.env.JWT_SECRET!;

export function signToken(payload: { id: string; role: string }) {
  ////console.log("Running signToken")
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string) {
  ////console.log("Running verifyToken ")
  return jwt.verify(token, SECRET) as { id: string; role: string };
}
