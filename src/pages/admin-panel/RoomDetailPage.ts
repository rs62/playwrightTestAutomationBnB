import { expect, type Locator, type Page } from '@playwright/test';
import { Action as action } from '../../utils/ActionsUtil';
import logger from '../../utils/LoggerUtil';
import { roomInterface, bookingInterface } from '../../Interfaces';

export default class RoomDetailPage {
  readonly page: Page;

  readonly headerRowElements: Locator;
  readonly headerRowElementsText: string[] = [
    'First name',
    'Last name',
    'Price',
    'Deposit paid?',
    'Check in',
    'Check out',
  ];

  readonly numberText: Locator;
  readonly featuresText: Locator;
  readonly image: Locator;
  readonly typeText;
  readonly accessibleText;
  readonly priceText;
  readonly descriptionText;

  readonly editButton: Locator;
  readonly updateButton: Locator;
  readonly cancelButton: Locator;

  readonly numberTextbox: Locator;
  readonly typeCombobox: Locator;
  readonly accessibleCombobox: Locator;
  readonly priceTextbox: Locator;
  readonly descriptionTextbox: Locator;
  readonly imageTextbox: Locator;

  readonly WifiCheckbox: Locator;
  readonly refreshmentsCheckbox: Locator;
  readonly tvCheckbox: Locator;
  readonly safeCheckbox: Locator;
  readonly radioCheckbox: Locator;
  readonly viewsCheckbox: Locator;
  readonly feature: {};

  readonly bookingDataRows: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.headerRowElements = page.locator('css=div.rowHeader p');

    this.numberText = page.locator('css=div.room-details h2');
    this.featuresText = page.locator(
      'xpath=//p[contains(text(),"Features")]/span'
    );
    this.typeText = page.locator('xpath=//p[contains(text(),"Type")]/span');
    this.accessibleText = page.locator(
      'xpath=//p[contains(text(),"Accessible")]/span'
    );
    this.priceText = page.locator(
      'xpath=//p[contains(text(),"Room price")]/span'
    );
    this.descriptionText = page.locator(
      'xpath=//p[contains(text(),"Description")]/span'
    );
    this.image = page.locator('css=div.room-details img');

    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    this.numberTextbox = page.locator('css=input#roomName');
    this.typeCombobox = page.locator('css=#type');
    this.accessibleCombobox = page.locator('css=#accessible');
    this.priceTextbox = page.locator('css=#roomPrice');
    this.descriptionTextbox = page.getByRole('textbox', {
      name: 'Description',
    });
    this.imageTextbox = page.getByRole('textbox', {
      name: 'Image:',
    });

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

    this.bookingDataRows = page.locator(
      `//div[contains(@class,'detail booking')]`
    );
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

  async fillDescription(description: string) {
    await action.fillTextbox(
      this.descriptionTextbox,
      description,
      'room description'
    );
  }

  async fillImageUrl(imageUrl: string) {
    await action.fillTextbox(this.imageTextbox, imageUrl, 'room image url');
  }

  async checkFeaturesCheckboxes(features: string[]) {
    //initial
    const reset = ['WiFi', 'Safe', 'Refreshments', 'Views', 'Radio', 'TV'];
    for (let feature of reset) {
      await action.setCheckboxValue(this.feature[feature], false, feature);
    }
    // update
    for (let feature of features) {
      await action.setCheckboxValue(this.feature[feature], true, feature);
    }
    logger.info('Checked room features checkbox');
  }

  async clickEditButton() {
    await action.click(this.editButton, 'edit button');
  }
  async clickUpdateButton() {
    await action.click(this.updateButton, 'update button');
  }
  async clickCancelButton() {
    await action.click(this.cancelButton, 'cancel button');
  }

  async updateRoom(old: roomInterface, roomData: roomInterface) {
    await expect(this.numberText.filter({ hasText: old.number })).toBeVisible({
      timeout: 20_000,
    });
    await this.clickEditButton();
    await this.fillRoomNumber(roomData.number);
    await this.SelectRoomType(roomData.type);
    await this.SelectRoomAccessibility(roomData.accessiblity);
    await this.fillRoomPrice(roomData.price);
    await this.checkFeaturesCheckboxes(roomData.features);
    roomData.description && (await this.fillDescription(roomData.description));
    roomData.image && (await this.fillImageUrl(roomData.image));
    await this.clickUpdateButton();
    await this.verifyRoomDetailsData(roomData);
  }

  async verifyRoomDetailsData(roomData: roomInterface) {
    await expect(this.numberText).toContainText(roomData.number);
    await expect(this.typeText).toHaveText(roomData.type);
    await expect(this.accessibleText).toHaveText(
      roomData.accessiblity.toString()
    );
    await expect(this.priceText).toHaveText(roomData.price);
    await expect(this.featuresText).toHaveText(
      roomData.features.length > 0
        ? roomData.features.join(', ')
        : 'No features added to the room'
    );
    roomData.image &&
      (await expect(this.image).toHaveAttribute('src', roomData.image));
    roomData.description &&
      (await expect(this.descriptionText).toHaveText(roomData.description));

    logger.info('Room data verified');
  }

  async getBookingDataRowLocator(booking: bookingInterface) {
    const bookingRow = await this.bookingDataRows
      .filter({
        hasText: booking.firstname,
      })
      .filter({ hasText: booking.lastname });
    return bookingRow;
  }
  async verifyRoomBookingData(booking: bookingInterface) {
    const rowLocator = await this.getBookingDataRowLocator(booking);

    await expect(rowLocator)
      .toHaveText(
        [
          booking.firstname,
          booking.lastname,
          booking.price,
          booking.depositpaid?.toString(),
          booking.bookingdates.checkin,
          booking.bookingdates.checkout,
        ].join('')
      )
      .catch((error) => {
        logger.error(`Error verifying booking data: ${error}`);
        throw error;
      })
      .then(() => {
        logger.info('Booking data verified');
      });
  }
}
