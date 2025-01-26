import { expect, type Locator, type Page } from '@playwright/test';
import { contactInterface } from '../Interfaces';
import { Action as action } from '../utils/ActionsUtil';
import logger from '../utils/LoggerUtil';

export default class HomePage {
  readonly page: Page;

  readonly hotelLogoImage: Locator;
  readonly hotelDescription: Locator;
  readonly roomHeader: Locator;

  readonly contactNameTextbox: Locator;
  readonly contactEmailTextbox: Locator;
  readonly contactPhoneTextbox: Locator;
  readonly contactSubjectTextbox: Locator;
  readonly ContactDescription: Locator;
  readonly submitContactButton: Locator;
  readonly submitMessageText: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.hotelLogoImage = page.getByRole('img', { name: 'Hotel logoUrl' });
    this.hotelDescription = page.locator('css=div.hotel-description p');
    this.roomHeader = page.getByRole('heading', { name: 'Rooms' });

    this.contactNameTextbox = page.getByTestId('ContactName');
    this.contactEmailTextbox = page.getByTestId('ContactEmail');
    this.contactPhoneTextbox = page.getByTestId('ContactPhone');
    this.contactSubjectTextbox = page.getByTestId('ContactSubject');
    this.ContactDescription = page.getByTestId('ContactDescription');
    this.submitContactButton = page.getByRole('button', { name: 'Submit' });
    this.submitMessageText = page.locator('css=div.contact div div');
  }
  //locators
  roomLocator = (roomNumber: string) =>
    this.page.locator('div:has(> div.hotel-room-info)').filter({
      has: this.page.locator(`//img[contains(@alt,'${roomNumber}')]`),
    });

  roomDescriptionText = (roomLocator: Locator) => roomLocator.locator('css=p');
  roomImage = (roomLocator: Locator) => roomLocator.locator('css=img');
  roomTypeText = (roomLocator: Locator) => roomLocator.locator('css=h3');
  roomAccessibility = (roomLocator: Locator) =>
    roomLocator.locator('css=span.wheelchair');
  roomFeatures = (roomLocator: Locator) => roomLocator.locator('css=ul');

  bookRoomButton = (roomLocator: Locator) =>
    roomLocator.getByRole('button', { name: 'Book this room' });

  // actions
  async goto() {
    await this.page.goto('/');
  }

  async fillcontactName(name: string) {
    await action.fillTextbox(this.contactNameTextbox, name, 'contact name');
  }

  async fillcontactEmail(email: string) {
    await action.fillTextbox(this.contactEmailTextbox, email, 'contact email');
  }

  async fillcontactPhone(email: string) {
    await action.fillTextbox(this.contactPhoneTextbox, email, 'contact phone');
  }

  async fillcontactSubject(subject: string) {
    await action.fillTextbox(
      this.contactSubjectTextbox,
      subject,
      'contact phone'
    );
  }

  async fillcontactDescription(decription: string) {
    await action.fillTextbox(
      this.ContactDescription,
      decription,
      'contact description'
    );
  }

  async clickSubmitButton() {
    await action.click(this.submitContactButton, 'submit button');
  }

  async verifyContactFormSubmission(data: contactInterface) {
    await this.fillcontactName(data.name);
    await this.fillcontactEmail(data.email);
    await this.fillcontactPhone(data.phone);
    await this.fillcontactSubject(data.subject);
    await this.fillcontactDescription(data.message);
    await this.clickSubmitButton();
    await expect(this.submitContactButton).toBeHidden();

    const messageText =
      `Thanks for getting in touch ${data.name}!` +
      `We'll get back to you about` +
      `${data.subject}` +
      `as soon as possible.`;
    await expect(this.submitMessageText).toHaveText(messageText);
  }

  async assertRoomDescription(roomNumber: string, expectedText: string) {
    const room = await this.roomLocator(roomNumber);
    await this.roomDescriptionText(room).hover();
    await expect
      .soft(this.roomDescriptionText(room))
      .toHaveText(expectedText)
      .catch((error) => {
        logger.error(
          `Error in verifying room description in home page: ${error}`
        );
        throw error;
      })
      .then(() => {
        logger.info(`room description verified in home page`);
      });
  }
  async assertRoomType(roomNumber: string, expectedText: string) {
    const room = await this.roomLocator(roomNumber);
    await expect.soft(this.roomTypeText(room)).toBeVisible();
    await expect
      .soft(this.roomTypeText(room))
      .toHaveText(expectedText)
      .catch((error) => {
        logger.error(`Error in verifying room type in home page: ${error}`);
        throw error;
      })
      .then(() => {
        logger.info(`room type verified in home page`);
      });
  }

  async assertRoomFeatures(roomNumber: string, features: string[]) {
    const room = await this.roomLocator(roomNumber);
    if (features.length > 0) {
      await expect
        .soft(this.roomFeatures(room))
        .toHaveText(features.join(''))
        .catch((error) => {
          logger.error(
            `Error in verifying room features in home page: ${error}`
          );
          throw error;
        })
        .then(() => {
          logger.info(`room features verified in home page`);
        });
    }
  }

  async assertRoomAccessiblity(roomNumber: string, accessibile: boolean) {
    try {
      const room = await this.roomLocator(roomNumber);
      if (accessibile) {
        await expect.soft(this.roomAccessibility(room)).toBeVisible();
      } else {
        await expect.soft(this.roomAccessibility(room)).toBeHidden();
      }
    } catch (error) {
      logger.error(
        `Error in verifying room accessibility in home page: ${error}`
      );
    }

    logger.info(`room accessibility verified in home page`);
  }
}
