import { expect, Locator, APIRequestContext } from '@playwright/test';
import logger from './LoggerUtil';
import { bookingInterface } from '../Interfaces';

export abstract class Action {
  static fillTextbox = async (
    locator: Locator,
    value: string,
    fieldName: string
  ) => {
    await locator.fill(value);
    logger.info(`Filled ${fieldName}`);
  };

  static selectOptionInCombobox = async (
    locator: Locator,
    option: string,
    fieldName: string
  ) => {
    await locator.selectOption(option);
    logger.info(`Selected '${option}' in ${fieldName}`);
  };

  static click = async (locator: Locator, fieldName: string) => {
    await locator
      .click()
      .catch((error) => {
        logger.error(`Error clicking ${fieldName}: ${error}`);
        throw error;
      })
      .then(() => logger.info(`Clicked ${fieldName}`));
  };

  static setCheckboxValue = async (
    locator: Locator,
    value: boolean,
    fieldName: string
  ) => {
    await locator
      .setChecked(value)
      .catch((error) => {
        logger.error(`Error setting ${fieldName}: ${error}`);
        throw error;
      })
      .then(() => logger.info(`Value is set for checkbox ${fieldName}`));
  };

  static verifyHeaderRowText = async (
    locator: Locator,
    expectedText: string[],
    pageName: string
  ) => {
    await expect(locator)
      .toHaveText(expectedText)
      .catch((error) => {
        logger.error(
          `Error in verifying header row text in ${pageName}: ${error}`
        );
        throw error;
      })
      .then(() => {
        logger.info(`Header row text verified in ${pageName}`);
      });
  };

  static apiGetRoomByRoomNumber = async (
    request: APIRequestContext,
    roomNumber: string
  ) => {
    const response = await request.get('/room/');

    expect(response.status()).toBe(200);
    const body = await response.json();
    const room = body.rooms.filter((item) => {
      return item.roomName === roomNumber;
    });

    return room[0];
  };

  static apiBookRoomByRoomNumber = async (
    request: APIRequestContext,
    data: bookingInterface
  ) => {
    const room =
      data.roomid &&
      (await Action.apiGetRoomByRoomNumber(request, data.roomid));

    console.log('roomid', room.roomid);
    data.roomid = room.roomid;
    const response = await request.post('/booking/', {
      data: {
        ...data,
      },
    });
    return response;
  };
}
