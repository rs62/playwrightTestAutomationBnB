import { expect, type Locator, type Page } from '@playwright/test';
import { Action as action } from '../../utils/ActionsUtil';

import { contactInterface } from '../../Interfaces';

export default class MessagePage {
  readonly page: Page;
  readonly messageRow: Locator;
  readonly messageDetail: Locator;
  readonly closeMessageButton: Locator;
  readonly deleteMessageLocator: string;

  public constructor(page: Page) {
    this.page = page;
    this.messageRow = page.locator('div.detail');
    this.messageDetail = page.getByTestId('message');
    this.closeMessageButton = page.getByRole('button', { name: 'Close' });
    this.deleteMessageLocator = '.fa-remove';
  }

  async getMessageRow(data: contactInterface) {
    const messageRow = await this.messageRow
      .filter({ hasText: data.subject })
      .and(this.messageRow.filter({ hasText: data.name }));
    return messageRow;
  }

  async clickMessageRow(data: contactInterface) {
    action.click(await this.getMessageRow(data), 'message row');
  }

  async clickCloseMessage() {
    await action.click(this.closeMessageButton, 'close message button');
  }
  async openUnreadMessage(data: contactInterface) {
    const expectedText =
      `From: ${data.name}` +
      `Phone: ${data.phone}` +
      `Email: ${data.email}` +
      data.subject +
      data.message +
      `Close`;

    await this.clickMessageRow(data);
    await expect(this.messageDetail).toHaveText(expectedText);
    await this.clickCloseMessage();
    const messageRow = await this.getMessageRow(data);
    await expect(messageRow).toHaveClass('row detail read-true');
  }

  async deleteMessage(data) {
    const messageRow = await this.getMessageRow(data);
    const deleteMessage = await messageRow.locator(this.deleteMessageLocator);
    await action.click(deleteMessage, 'delete message');
    await expect(messageRow).toHaveCount(0);
  }
}
