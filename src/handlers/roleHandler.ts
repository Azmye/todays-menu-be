import db from "@db/index";
import { roles } from "@db/schema";
import { roleDto } from "@dto/roleDto";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export const getRoles = async () => {
  const roles = await db.query.roles.findMany();

  return roles;
};

export const getRole = async ({
  uuid,
  roleName,
}: {
  uuid?: string;
  roleName?: string;
}) => {
  const role = await db.query.roles.findFirst({
    where: roleName ? eq(roles.name, roleName) : eq(roles.uuid, uuid!),
  });

  return {
    role: role || null,
  };
};

export const roleInsert = async (request: roleDto) => {
  const isRoleExists = await getRole({ roleName: request.name });

  if (isRoleExists.role) {
    throw new HTTPException(409, {
      message: "Role is already exists!",
    });
  }

  const [newRole] = await db
    .insert(roles)
    .values({
      name: request.name!,
    })
    .returning();

  return {
    newRole,
  };
};

export const roleUpdate = async (request: roleDto) => {
  await getRole({ uuid: request.uuid! });

  const [updatedRole] = await db
    .update(roles)
    .set({
      name: request.name!,
    })
    .where(eq(roles.uuid, request.uuid!))
    .returning();

  return {
    updatedRole,
  };
};

export const roleDelete = async (uuid: string) => {
  await getRole({ uuid: uuid });

  const deletedRole = await db.delete(roles).where(eq(roles.uuid, uuid));

  return {
    deletedRole,
  };
};
