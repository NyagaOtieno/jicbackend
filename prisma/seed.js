import { prisma } from "../src/prisma.js";

async function main() {
  const items = [
    { code: "BRK_EFF", name: "Brake efficiency", group: "BRAKES", weightPct: 30 },
    { code: "STR_UNDER", name: "Structural/underbody integrity", group: "STRUCTURE", weightPct: 25 },
    { code: "EMS_LIMIT", name: "Emissions within limits", group: "EMISSIONS", weightPct: 15 },
    { code: "SUS_STEER", name: "Suspension and steering condition", group: "SUSPENSION_STEERING", weightPct: 10 },
    { code: "LGT_HEAD", name: "Headlights alignment & lighting", group: "LIGHTING_ELECTRICAL", weightPct: 10 },
    { code: "TYR_TREAD", name: "Tyre tread / condition", group: "TYRES", weightPct: 10 }
  ];

  for (const it of items) {
    await prisma.inspectionItem.upsert({
      where: { code: it.code },
      update: it,
      create: it
    });
  }

  console.log("Seeded inspection items.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });