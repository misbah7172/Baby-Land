import { prisma } from '../lib/prisma';

function deserializeSetting(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export async function getSettingsGroup(group: string) {
  const settings = await prisma.siteSetting.findMany({
    where: { group },
    orderBy: { key: 'asc' }
  });

  return settings.reduce<Record<string, unknown>>((result, setting) => {
    result[setting.key] = deserializeSetting(setting.value);
    return result;
  }, {});
}

export async function upsertSettingsGroup(group: string, settings: Record<string, unknown>) {
  await prisma.$transaction(
    Object.entries(settings).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { group_key: { group, key } },
        update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
        create: { group, key, value: typeof value === 'string' ? value : JSON.stringify(value) }
      })
    )
  );

  return getSettingsGroup(group);
}