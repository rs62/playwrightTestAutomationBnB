import { test, expect } from '../fixtures/login-admin-fixture';

import { Action as action } from '../utils/ActionsUtil';
// Test data to be put in testdata folder for parameterised test
const room = {
  number: 'ABC103',
  type: 'Single',
  accessiblity: false,
  description: 'Please enter a description for this room',
  image: 'https://www.mwtestconsultancy.co.uk/img/room1.jpg',
  price: '400',
  features: [],
};

const bookingData = {
  bookingdates: { checkin: '2025-01-06', checkout: '2025-01-16' },
  depositpaid: false,
  firstname: 'FName',
  lastname: 'lastname',
  roomid: 'ABC103',
  email: 'test@test.com',
  phone: '3983288237868',
  price: '4000',
};

const bookingData2 = {
  bookingdates: { checkin: '2025-01-13', checkout: '2025-01-16' },
  depositpaid: false,
  firstname: 'Second',
  lastname: 'lastname',
  roomid: 'ABC103',
  email: 'test@test.com',
  phone: '3983288237868',
  price: '4000',
};

test.describe.configure({ mode: 'serial' });

test('verify POST /booking', async ({ roomsPage, request }) => {
  // pre-requisite create new room
  await roomsPage.createRoom(room);
  // call API
  const response = await action.apiBookRoomByRoomNumber(request, bookingData);
  expect.soft(response.status()).toBe(201);
  // verify booking is displayed on rooms detail page
  const roomDetailsPage = await roomsPage.goToRoomDetailPage(room);

  //updating price for verification
  await roomDetailsPage.verifyRoomBookingData(bookingData);
});

test('verify POST /booking does not allow overlapping bookings', async ({
  request,
  roomsPage,
}) => {
  // call API
  const response = await action.apiBookRoomByRoomNumber(request, bookingData2);
  // verify response matches expected
  expect.soft(response.status()).toBe(409);

  //clean up
  await roomsPage.deleteRoom(room);
});
