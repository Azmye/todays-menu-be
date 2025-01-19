import db from "@db/index";
import { roles, userRoles, users } from "@db/schema";
import { LoginDto, RegisterDto } from "@dto/authDto";
import { eq, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateToken } from "utils/jwt";

export const register = async (request: RegisterDto) => {
  const existingUser = await db.query.users.findFirst({
    where: or(
      eq(users.email, request.email),
      eq(users.username, request.username)
    ),
  });

  if (existingUser) {
    throw new HTTPException(409, {
      message: "Email or Username is exists",
    });
  }

  const hashedPassword = await Bun.password.hash(request.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const [newUser] = await db
    .insert(users)
    .values({
      ...request,
      password: hashedPassword,
    })
    .returning();

  const customerRole = await db.query.roles.findFirst({
    where: eq(roles.name, request.role || "customer"),
  });

  if (customerRole) {
    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: customerRole.id,
    });
  }

  const token = await generateToken({
    email: newUser.email,
    role: [customerRole?.name],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
  });

  return {
    accessToken: token,
  };
};

export const login = async (request: LoginDto) => {
  const user = await db.query.users.findFirst({
    where: or(
      eq(users.email, request.credential),
      eq(users.username, request.credential)
    ),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new HTTPException(404, { message: "Invalid credentials" });
  }

  const isPasswordValid = await Bun.password.verify(
    request.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new HTTPException(401, {
      message: "Wrong password!",
    });
  }

  const token = await generateToken({
    email: user.email,
    role: [user.userRoles.map((ur) => ur.role.name)],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
  });

  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  return {
    accessToken: token,
  };
};
