import { test } from '../fixtures/login-admin-fixture';
import { expect } from '@playwright/test';
import logger from '../utils/LoggerUtil';
import roomsData from '../testdata/rooms.json';
import { roomInterface } from '../Interfaces';
import HomePage from '../pages/HomePage';

test.describe.configure({ mode: 'parallel' });

test.describe('verify admin pages requires login', () => {
  test.describe.configure({ mode: 'parallel' });
  const pages = [
    ['rooms', '/#/admin'],
    ['report', '/#/admin/report'],
    ['branding', '/#/admin/branding'],
    ['messages', '/#/admin/messages'],
  ];
  for (const [pageName, pageUrl] of pages) {
    test(`verify ${pageName} page requires login`, async ({ page }) => {
      logger.info(`Test for ${pageName} requires login is started...`);
      await page.goto(pageUrl);
      await expect(page.getByText('Log into your account')).toBeVisible();
      logger.info(`Test for ${pageName} page requires login  is completed`);
    });
  }

  test('verify Rooms Page header row text after login', async ({
    roomsPage,
  }) => {
    logger.info('Test for Rooms Page header row text is started...');
    await roomsPage.verifyUserLoggedIn();
    await roomsPage.verifyHeaderRowText();
    logger.info('Test for Rooms Page header row text is completed');
  });
});

test.describe('verify room create, delete', () => {
  test.describe.configure({ mode: 'serial' });

  for (const room of roomsData) {
    test(`verify room creation room ${room.number}`, async ({ roomsPage }) => {
      logger.info('Test for Room Creation is started...');
      await roomsPage.createRoom(room);
      logger.info('Test for Room Creation is completed');
    });

    test(`verify room ${room.number} in home page`, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      if (room.description) {
        await homePage.assertRoomDescription(room.number, room.description);
      } else {
        const description = 'Please enter a description for this room';
        await homePage.assertRoomDescription(room.number, description);
      }
      await homePage.assertRoomType(room.number, room.type);
      await homePage.assertRoomAccessiblity(room.number, room.accessiblity);
      await homePage.assertRoomFeatures(room.number, room.features);
    });

    test(`verify room data update room ${room.number}`, async ({
      roomsPage,
    }) => {
      logger.info('Test for Room Detail Update is started...');
      const roomDetailPage = await roomsPage.goToRoomDetailPage(room);

      //creating a deep copy of room data
      let updatedRoom: roomInterface = JSON.parse(JSON.stringify(room));
      updatedRoom.description = 'updated description';
      updatedRoom.image = 'https://someimage.image';
      updatedRoom.price = '500';
      updatedRoom.features = ['WiFi', 'Safe'];
      updatedRoom.type = 'Family';
      updatedRoom.accessiblity = true;

      await roomDetailPage.updateRoom(room, updatedRoom);
      logger.info('Test for Room Detail Update is completed');
    });

    test(`verify room deletion ${room.number}`, async ({ roomsPage }) => {
      logger.info('Test for Room Deletion is started...');
      await roomsPage.deleteRoom(room);
      logger.info('Test for Room Deletion is completed');
    });
  }
});

const negativeScenario = [
  {
    number: 'RMO104',
    type: 'Family',
    accessiblity: false,
    price: '100.0',
    features: ['WiFi', 'Safe', 'Views'],
  },
  {
    number: 'RMO105',
    type: 'Suite',
    accessiblity: false,
    price: '1000',
    features: ['WiFi', 'Safe', 'Views'],
  },
];

for (const room of negativeScenario) {
  test(`verify room creation room ${room.number}`, async ({ roomsPage }) => {
    logger.info('Test for Room Creation is started...');
    await roomsPage.createRoom(room);
    logger.info('Test for Room Creation is completed');
  });
}
