import { test, expect } from '../fixtures/login-admin-fixture';
import logger from '../utils/LoggerUtil';
import HomePage from '../pages/HomePage';

test.describe.configure({ mode: 'serial' });

const data = {
  name: 'John Abcd',
  email: 'test@te.com',
  phone: '070000001000',
  subject: 'Subject Entered',
  message: 'Contact for to check rooms availability in Summer Vacations.',
};

test(`verify contact form submission`, async ({ page }) => {
  logger.info('Test for contact form submission is started...');
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.verifyContactFormSubmission(data);
  logger.info('Test for contact form submission is completed');
});

test(`verify message in admin inbox`, async ({ roomsPage }) => {
  logger.info('Test for message in admin inbox is started...');
  const messagePage = await roomsPage.goToMessagePage();
  await messagePage.openUnreadMessage(data);
  await messagePage.deleteMessage(data);
  logger.info('Test for message in admin inbox is completed');
});
