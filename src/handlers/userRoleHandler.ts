import db from "@db/index";
import { roles } from "@db/schema";
import userRoles from "@db/schema/userRole";
import { and, eq, inArray } from "drizzle-orm";
import { getUser } from "./userHandler";
import { UserRoleDto } from "@dto/userRoleDto";

export const userRoleUpdate = async ({ userUuid, newRoles }: UserRoleDto) => {
  const { user } = await getUser(userUuid);

  const currentRoles = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, user.id),
    with: {
      role: {
        columns: { name: true, uuid: true },
      },
    },
  });

  const currentRolesIds = currentRoles.map((r) => r.roleId);
  const newRoleIds = await db.query.roles.findMany({
    where: inArray(roles.name, newRoles),
    columns: { id: true },
  });

  // Determine roles to add and remove
  const rolesToAdd = newRoleIds.filter(
    (role) => !currentRolesIds.includes(role.id)
  );
  const rolesToRemove = currentRolesIds.filter(
    (roleId) => !newRoleIds.some((newRole) => newRole.id === roleId)
  );

  // Perform database transactions to update roles
  await db.transaction(async (tx) => {
    // Remove old roles
    if (rolesToRemove.length > 0) {
      await tx
        .delete(userRoles)
        .where(
          and(
            eq(userRoles.userId, user.id),
            inArray(userRoles.roleId, rolesToRemove)
          )
        );
    }

    // Add new roles
    if (rolesToAdd.length > 0) {
      await tx.insert(userRoles).values(
        rolesToAdd.map((role) => ({
          userId: user.id,
          roleId: role.id,
        }))
      );
    }
  });

  return await getUser(userUuid);
};
