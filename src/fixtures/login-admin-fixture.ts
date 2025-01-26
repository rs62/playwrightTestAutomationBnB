import { test as base, expect as defaultExpect } from '@playwright/test';
import LoginPage from '../pages/admin-panel/LoginPage';
import RoomsPage from '../pages/admin-panel/RoomsPage';
import RoomDetailPage from '../pages/admin-panel/RoomDetailPage';
import MessagePage from '../pages/admin-panel/MessagePage';

type UIPages = {
  roomsPage: RoomsPage;
};

export const expect = defaultExpect;
// fixture to complete long and open admin panel rooms page
export const test = base.extend<UIPages>({
  roomsPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const roomsPage = await loginPage.login(
      process.env.USER_ID!,
      process.env.PASSWORD!
    );
    await use(roomsPage);
  },
});
