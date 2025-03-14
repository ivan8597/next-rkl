import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

const vapidKeys = {
  publicKey: 'BLuS5MKm1UWBFyAlI2X93ttuRuMW43HLKMIqlaqTB2YamvPi3RNc2W2MtEjUSlcGi1ovXlFlhhWsBvBse3U99Dc',
  privateKey: 'XBAXtpqaCGp3AD3dK9WkyBS89uMjbQ1hnFRmT3JIZNg'
};

webpush.setVapidDetails(
  'mailto:ivan8597@yandex.ru', 
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Нет данных подписки' },
        { status: 400 }
      );
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Подписка',
        body: 'Вы подписаны!'
      })
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка в маршруте подписки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}