import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

const contactSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().optional()
});

app.post('/checkout', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, phoneNumber } = parsed.data;

  const orConditions: any[] = [];
  if (email) orConditions.push({ email });
  if (phoneNumber) orConditions.push({ phoneNumber });

  const matched = await prisma.contact.findMany({
    where: { OR: orConditions },
    orderBy: { createdAt: 'asc' }
  });

  if (matched.length === 0) {
    const newContact = await prisma.contact.create({
      data: { email, phoneNumber }
    });
    return res.json({
      contact: {
        primaryContactId: newContact.id,
        emails: [email].filter(Boolean),
        phoneNumbers: [phoneNumber].filter(Boolean),
        secondaryContactIds: []
      }
    });
  }

  let primary = matched.find((c: { linkPrecedence: string; }) => c.linkPrecedence === 'primary') ?? matched[0];
  for (const contact of matched) {
    if (contact.linkPrecedence === 'primary' && contact.id !== primary.id) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          linkPrecedence: 'secondary',
          linkedId: primary.id
        }
      });
    }
  }

  const all = await prisma.contact.findMany({
    where: {
      OR: [{ id: primary.id }, { linkedId: primary.id }]
    }
  });

  const emails = new Set<string>();
  const phones = new Set<string>();
  const secondaries: number[] = [];

  all.forEach((c: { email: string; phoneNumber: string; linkPrecedence: string; id: number; }) => {
    if (c.email) emails.add(c.email);
    if (c.phoneNumber) phones.add(c.phoneNumber);
    if (c.linkPrecedence === 'secondary') secondaries.push(c.id);
  });

  const exists = all.some((c: { email: string | undefined; phoneNumber: string | undefined; }) => c.email === email && c.phoneNumber === phoneNumber);
  if (!exists && (email || phoneNumber)) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primary.id
      }
    });
    if (email) emails.add(email);
    if (phoneNumber) phones.add(phoneNumber);
  }

  res.json({
    contact: {
      primaryContactId: primary.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phones),
      secondaryContactIds: secondaries
    }
  });
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));