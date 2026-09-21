import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD no válidos en .env");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`No existe el usuario ${email}. Ejecuta: npx prisma db seed`);
  }

  const alreadyOk = await compare(password, user.passwordHash);
  if (alreadyOk) {
    console.log("OK: la contraseña del .env ya coincide con la base.");
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await hash(password, 12) },
  });
  console.log("OK: contraseña del admin actualizada desde el .env.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
