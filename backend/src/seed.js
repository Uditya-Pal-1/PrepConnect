import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Opportunity from './models/Opportunity.js';

dotenv.config();

if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI before running the seed command.');
if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 12) {
  throw new Error('Set SEED_PASSWORD to a development-only password of at least 12 characters.');
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  let ngo = await User.findOne({ email: 'hello@brightpath.org' });
  if (!ngo) {
    ngo = await User.create({
      fullName: 'Bright Path Foundation', organizationName: 'Bright Path Foundation',
      email: 'hello@brightpath.org', password: await bcrypt.hash(process.env.SEED_PASSWORD, 12),
      role: 'NGO', location: 'Bengaluru, India',
      organizationDescription: 'A community nonprofit helping young people access practical learning and opportunity.',
    });
  }

  const examples = [
    { title: 'Make learning resources easier to find', description: 'Help us improve the structure and accessibility of our free learning library so students can get to the resources they need.', category: 'Technology', location: 'Remote', duration: '2–3 weeks', requiredSkills: ['Web development', 'Accessibility'] },
    { title: 'Tell the story of our community program', description: 'Create a friendly, thoughtful visual campaign that helps families and local partners understand our work.', category: 'Design', location: 'Bengaluru or remote', duration: '1–2 weeks', requiredSkills: ['Graphic design', 'Storytelling'] },
    { title: 'Coach students in digital basics', description: 'Join a small group of volunteer mentors for weekly online sessions on useful digital skills and confident learning.', category: 'Education', location: 'Remote', duration: '1 hour weekly', requiredSkills: ['Teaching', 'Communication'] },
  ];
  for (const example of examples) {
    if (!await Opportunity.exists({ ngoId: ngo._id, title: example.title })) {
      await Opportunity.create({ ...example, ngoId: ngo._id, organization: ngo.organizationName });
    }
  }
  console.log('Development opportunities are ready. NGO demo email: hello@brightpath.org');
} finally {
  await mongoose.disconnect();
}
