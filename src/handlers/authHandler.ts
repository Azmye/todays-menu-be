import db from "@db/index";
import { refreshTokens, roles, userRoles, users } from "@db/schema";
import { LoginDto, RefreshTokenDto, RegisterDto } from "@dto/authDto";
import { and, eq, isNull, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateToken } from "@utils/jwt";
import { randomBytes } from "crypto";
import { User } from "@db/schema/user";
import { RefreshToken } from "@db/schema/refreshToken";

const generateRefreshToken = () => randomBytes(40).toString("hex");

const createRefreshToken = async (userId: number) => {
  const token = generateRefreshToken();
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 30);

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({
      token,
      userId,
      expiresAt,
    })
    .returning();

  return refreshToken;
};

const generateTokenPair = async (user: User, userRoles: string[]) => {
  const accessToken = await generateToken({
    email: user.email,
    role: userRoles,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
  });

  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
  };
};

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

  const roleName = request.role || "customer";

  let role = await db.query.roles.findFirst({
    where: eq(roles.name, roleName),
  });

  if (!role) {
    [role] = await db.insert(roles).values({ name: roleName }).returning();
  }

  await db.insert(userRoles).values({
    userId: newUser.id,
    roleId: role.id,
  });

  return generateTokenPair(newUser, [role?.name!]);
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

  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  const userRoles = user.userRoles.map((ur) => ur.role.name);
  return generateTokenPair(user, userRoles);
};

export const refreshToken = async (request: RefreshTokenDto) => {
  const token = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.token, request.refreshToken),
      isNull(refreshTokens.revokedAt)
    ),
    with: {
      user: {
        with: {
          userRoles: {
            with: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!token || new Date() > token.expiresAt) {
    throw new HTTPException(401, { message: "Invalid refresh token" });
  }

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, token.id));

  const userRoles = token.user.userRoles.map((ur) => ur.role.name);

  return generateTokenPair(token.user, userRoles);
};

export const revokeRefreshToken = async (token: string) => {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token));
};

export const revokeAllUserRefreshTokens = async (userId: number) => {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt))
    );
};
