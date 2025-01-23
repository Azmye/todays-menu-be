import db from "@db/index";
import { users } from "@db/schema";
import { UserUpdateDto } from "@dto/userDto";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export const getAllUsers = async () => {
  const users = await db.query.users.findMany({
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  return users;
};

export const getUser = async (uuid: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.uuid, uuid),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new HTTPException(404, {
      message: "User not found!",
    });
  }

  return {
    user,
  };
};

export const userUpdate = async (request: UserUpdateDto, uuid: string) => {
  const isUserExists = await db.query.users.findFirst({
    where: eq(users.uuid, uuid),
  });

  if (!isUserExists) {
    throw new HTTPException(404, { message: "User not found!" });
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      email: request.email,
      password: request.password,
      username: request.username,
      firstName: request.firstName,
      lastName: request.lastName,
      phoneNumber: request.phoneNumber,
      profilePhotoUrl: request.profilePhotoUrl,
      dateOfBirth: request.dateOfBirth,
      gender: request.gender,
      isActive: request.isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.uuid, uuid))
    .returning();

  return {
    user: updatedUser,
  };
};

export const userDelete = async (uuid: string) => {
  const isUserExists = await db.query.users.findFirst({
    where: eq(users.uuid, uuid),
  });

  if (!isUserExists) {
    throw new HTTPException(404, { message: "User not found!" });
  }

  const result = await db.delete(users).where(eq(users.uuid, uuid)).returning();

  return result;
};
