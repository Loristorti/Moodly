import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { todayParis } from '../src/common/utils/date.js';
import { MoodTag, PrismaClient, Role } from '../src/generated/prisma/client.js';

/**
 * Demo data: 2 teams, 1 manager + 6 employees each, 30 working days of history.
 * Can be run again at any time: it empties the tables first.
 */

const PASSWORD = 'Moodly2026!';
const HISTORY_DAYS = 30;
const RUSH_WEEK = { from: 12, to: 16 }; // indexes of the "rush" working days
// Fewer than 3 answers: hidden in the chart. Both fall within the last 30 calendar
// days shown by the dashboard (the 30 working days of history cover about 6 weeks).
const SUPPORT_LOW_PARTICIPATION_DAYS = [19, 25];

const TEAMS = [
  {
    name: 'Équipe Produit',
    manager: {
      email: 'manager.produit@moodly.dev',
      firstName: 'Nathalie',
      lastName: 'Lambert',
    },
    employees: [
      ['Alice', 'Martin'],
      ['Thomas', 'Dubois'],
      ['Camille', 'Leroy'],
      ['Hugo', 'Moreau'],
      ['Léa', 'Fournier'],
      ['Julien', 'Girard'],
    ],
  },
  {
    name: 'Équipe Support',
    manager: {
      email: 'manager.support@moodly.dev',
      firstName: 'Philippe',
      lastName: 'Garnier',
    },
    employees: [
      ['Sarah', 'Bonnet'],
      ['Lucas', 'Mercier'],
      ['Emma', 'Rousseau'],
      ['Nicolas', 'Faure'],
      ['Chloé', 'André'],
      ['Maxime', 'Blanc'],
    ],
  },
] as const;

// Deterministic pseudo-random generator (mulberry32): same data on every run
let randomState = 2026;
function random(): number {
  randomState = (randomState + 0x6d2b79f5) | 0;
  let t = randomState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randomInt = (min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** "alice@moodly.dev", "lea@moodly.dev", "chloe@moodly.dev"... */
const emailFor = (firstName: string) =>
  `${firstName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}@moodly.dev`;

/** The last 30 working days (Monday to Friday), oldest first, today excluded. */
function workingDays(): Date[] {
  const days: Date[] = [];
  const day = todayParis();
  while (days.length < HISTORY_DAYS) {
    day.setUTCDate(day.getUTCDate() - 1);
    const weekDay = day.getUTCDay();
    if (weekDay !== 0 && weekDay !== 6) {
      days.unshift(new Date(day));
    }
  }
  return days;
}

/** Average mood of the day: stable, then a clear drop during the rush week, then a recovery. */
function expectedScore(dayIndex: number): number {
  if (dayIndex < RUSH_WEEK.from) return 3.8;
  if (dayIndex <= RUSH_WEEK.to) return 2.0;
  const daysAfterRush = dayIndex - RUSH_WEEK.to;
  return Math.min(3.9, 2.4 + daysAfterRush * 0.25);
}

function randomScore(dayIndex: number): number {
  const score = Math.round(expectedScore(dayIndex) + (random() - 0.5) * 2);
  return Math.max(1, Math.min(5, score));
}

function randomTags(score: number, isRush: boolean): MoodTag[] {
  const tags = new Set<MoodTag>();
  if (isRush && random() < 0.85) tags.add(MoodTag.WORKLOAD);

  const count = randomInt(0, 2);
  const pool =
    score <= 2
      ? [
          MoodTag.WORKLOAD,
          MoodTag.WORK_LIFE_BALANCE,
          MoodTag.MANAGEMENT,
          MoodTag.WORK_CONDITIONS,
        ]
      : [
          MoodTag.TEAM_SPIRIT,
          MoodTag.RECOGNITION,
          MoodTag.WORK_LIFE_BALANCE,
          MoodTag.MANAGEMENT,
        ];
  while (tags.size < Math.min(3, count + (isRush ? 1 : 0))) {
    tags.add(pick(pool));
  }
  return [...tags];
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  await prisma.$transaction([
    prisma.checkIn.deleteMany(),
    prisma.mood.deleteMany(),
    prisma.user.deleteMany(),
    prisma.team.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const days = workingDays();
  const accounts: { email: string; role: Role; team: string }[] = [];
  let moodCount = 0;

  for (const teamData of TEAMS) {
    const team = await prisma.team.create({ data: { name: teamData.name } });

    await prisma.user.create({
      data: {
        ...teamData.manager,
        role: Role.MANAGER,
        teamId: team.id,
        passwordHash,
      },
    });
    accounts.push({
      email: teamData.manager.email,
      role: Role.MANAGER,
      team: team.name,
    });

    const employeeIds: string[] = [];
    for (const [firstName, lastName] of teamData.employees) {
      const email = emailFor(firstName);
      const employee = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role: Role.EMPLOYEE,
          teamId: team.id,
          passwordHash,
        },
      });
      employeeIds.push(employee.id);
      accounts.push({ email, role: Role.EMPLOYEE, team: team.name });
    }

    const moods: {
      score: number;
      tags: MoodTag[];
      day: Date;
      teamId: string;
    }[] = [];
    const checkIns: { userId: string; day: Date }[] = [];

    days.forEach((day, dayIndex) => {
      const isRush = dayIndex >= RUSH_WEEK.from && dayIndex <= RUSH_WEEK.to;
      const lowParticipation =
        teamData.name === 'Équipe Support' &&
        SUPPORT_LOW_PARTICIPATION_DAYS.includes(dayIndex);
      // 60 to 90 % participation, or 2 answers on the low participation days
      const answers = lowParticipation
        ? 2
        : Math.round(employeeIds.length * (0.6 + random() * 0.3));

      for (let i = 0; i < answers; i++) {
        const score = randomScore(dayIndex);
        moods.push({
          score,
          tags: randomTags(score, isRush),
          day,
          teamId: team.id,
        });
      }
      // Check-ins go to randomly drawn employees: no link at all with the moods above
      for (const userId of shuffle([...employeeIds]).slice(0, answers)) {
        checkIns.push({ userId, day });
      }
    });

    await prisma.mood.createMany({ data: shuffle(moods) });
    await prisma.checkIn.createMany({ data: checkIns });
    moodCount += moods.length;
  }

  await prisma.$disconnect();

  const from = days[0].toISOString().slice(0, 10);
  const to = days[days.length - 1].toISOString().slice(0, 10);
  console.log(
    `\nSeed OK: ${moodCount} humeurs du ${from} au ${to} (aujourd'hui exclu).`,
  );
  console.log(`Mot de passe commun : ${PASSWORD}\n`);
  console.table(accounts);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
