import { expect, type Locator, type Page } from '@playwright/test';

import { roomInterface } from '../../Interfaces';
import RoomDetailPage from './RoomDetailPage';
import MessagePage from './MessagePage';

import logger from '../../utils/LoggerUtil';
import { Action as action } from '../../utils/ActionsUtil';

export default class RoomsPage {
  readonly page: Page;

  readonly headerRowElements: Locator;
  readonly headerRowElementsText: string[] = [
    'Room #',
    'Type',
    'Accessible',
    'Price',
    'Room details',
  ];
  readonly RoomDataRows: Locator;

  readonly logoutLink: Locator;
  readonly messageLink: Locator;

  readonly numberTextbox: Locator;
  readonly typeCombobox: Locator;
  readonly accessibleCombobox: Locator;
  readonly priceTextbox: Locator;

  readonly WifiCheckbox: Locator;
  readonly refreshmentsCheckbox: Locator;
  readonly tvCheckbox: Locator;
  readonly safeCheckbox: Locator;
  readonly radioCheckbox: Locator;
  readonly viewsCheckbox: Locator;
  readonly feature: {};

  readonly createButton: Locator;
  readonly deleteRoomLocator: string;

  public constructor(page: Page) {
    this.page = page;

    this.logoutLink = page.getByRole('link', { name: 'Logout' });
    this.messageLink = page
      .locator('css=a')
      .filter({ has: page.locator('css=i.fa-inbox') });

    this.headerRowElements = page.locator('css=div.rowHeader p');
    this.RoomDataRows = page.locator('div.row.detail');

    this.numberTextbox = page.getByTestId('roomName');
    this.typeCombobox = page.locator('css=#type');
    this.accessibleCombobox = page.locator('css=#accessible');
    this.priceTextbox = page.locator('css=#roomPrice');

    this.feature = {
      WiFi: (this.WifiCheckbox = page.getByRole('checkbox', { name: 'Wifi' })),
      Refreshments: (this.refreshmentsCheckbox = page.getByRole('checkbox', {
        name: 'Refreshments',
      })),
      TV: (this.tvCheckbox = page.getByRole('checkbox', { name: 'TV' })),
      Safe: (this.safeCheckbox = page.getByRole('checkbox', { name: 'Safe' })),
      Radio: (this.radioCheckbox = page.getByRole('checkbox', {
        name: 'Radio',
      })),
      Views: (this.viewsCheckbox = page.getByRole('checkbox', {
        name: 'Views',
      })),
    };

    this.createButton = page.getByRole('button', { name: 'Create' });
    this.deleteRoomLocator = '.roomDelete';
  }

  async goToRoomsPage() {
    await this.page.goto('/#/admin');
    logger.info('Navigated to admin panel rooms page');
  }

  async goToMessagePage() {
    await this.messageLink
      .click()
      .catch((error) => {
        logger.error(`Error clicking inbox message link: ${error}`);
        throw error;
      })
      .then(() => logger.info('Navigated to message page'));

    const messagePage = new MessagePage(this.page);
    return messagePage;
  }

  async goToRoomDetailPage(roomData: roomInterface) {
    await this.getRoomDataRowLocator(roomData)
      .click()
      .catch((error) => {
        logger.error(`Error clicking room data row: ${error}`);
        throw error;
      })
      .then(() => logger.info('Navigated to room detail page'));

    const roomDetailPage = new RoomDetailPage(this.page);
    return roomDetailPage;
  }

  async verifyHeaderRowText() {
    await action.verifyHeaderRowText(
      this.headerRowElements,
      this.headerRowElementsText,
      'rooms page'
    );
  }

  async verifyUserLoggedIn() {
    await expect(this.logoutLink)
      .toBeVisible()
      .catch((error) => {
        logger.error(`Error in during Login: ${error}`);
        throw error;
      })
      .then(() => {
        logger.info('User is Logged in');
      });
  }

  async fillRoomNumber(number: string) {
    await action.fillTextbox(this.numberTextbox, number, 'room number');
  }

  async SelectRoomType(type: string) {
    await action.selectOptionInCombobox(this.typeCombobox, type, 'room type');
  }

  async SelectRoomAccessibility(isAccessible: boolean) {
    await action.selectOptionInCombobox(
      this.accessibleCombobox,
      isAccessible.toString(),
      'room accessibility'
    );
  }

  async fillRoomPrice(price: string) {
    await action.fillTextbox(this.priceTextbox, price, 'room price');
  }

  async checkFeaturesCheckboxes(features: string[]) {
    for (let feature of features) {
      await action.setCheckboxValue(this.feature[feature], true, feature);
    }
    logger.info('Checked room features checkbox');
  }

  async clickCreateButton() {
    await action.click(this.createButton, 'create button');
  }

  getRoomDataRowLocator(roomData: roomInterface) {
    const room = this.RoomDataRows.filter({ hasText: roomData.number });
    return room;
  }

  async verifyRoomData(roomData: roomInterface) {
    await expect(this.getRoomDataRowLocator(roomData))
      .toHaveText(
        [
          roomData.number,
          roomData.type,
          roomData.accessiblity.toString(),
          roomData.price,
          roomData.features.length > 0
            ? roomData.features.join(', ')
            : 'No features added to the room',
        ].join('\n\r'),
        { useInnerText: true }
      )
      .catch((error) => {
        logger.error(`Error verifying room data: ${error}`);
        throw error;
      })
      .then(() => {
        logger.info('Room data verified');
      });
  }

  async createRoom(roomData: roomInterface) {
    await this.fillRoomNumber(roomData.number);
    await this.SelectRoomType(roomData.type);
    await this.SelectRoomAccessibility(roomData.accessiblity);
    await this.fillRoomPrice(roomData.price);
    await this.checkFeaturesCheckboxes(roomData.features);
    await this.clickCreateButton();
    await this.verifyRoomData(roomData);
  }

  async deleteRoom(roomData: roomInterface) {
    await this.getRoomDataRowLocator(roomData)
      .locator(this.deleteRoomLocator)
      .click()
      .catch((error) => {
        logger.error(`Error clicking delete room: ${error}`);
        throw error;
      })
      .then(() => logger.info('Clicked delete room'));

    await expect(this.RoomDataRows.filter({ hasText: roomData.number }))
      .toHaveCount(0)
      .catch((error) => {
        logger.error(`Error verifying deleted room: ${error}`);
        throw error; // rethrow the error if needed
      })
      .then(() => logger.info('Delete room verified'));
  }
}
