import process from 'node:process';

if (!process.env.V0_API_KEY) {
  console.error('Missing V0_API_KEY');
  process.exit(1);
}

console.log('V0_API_KEY is set.');
