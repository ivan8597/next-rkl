import { NextResponse } from 'next/server';

const vapidKeys = {
  publicKey: 'BLuS5MKm1UWBFyAlI2X93ttuRuMW43HLKMIqlaqTB2YamvPi3RNc2W2MtEjUSlcGi1ovXlFlhhWsBvBse3U99Dc',
  privateKey: 'XBAXtpqaCGp3AD3dK9WkyBS89uMjbQ1hnFRmT3JIZNg'
};

export async function GET() {
  return NextResponse.json({ publicKey: vapidKeys.publicKey });
} 