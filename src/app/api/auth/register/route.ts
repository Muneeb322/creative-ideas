import { register } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await register(body);

    if (!result) {
      return Response.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json({ success: true, user: result.user });
  } catch {
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
