import { expect, type Locator, type Page } from '@playwright/test';
import { Action as action } from '../../utils/ActionsUtil';
import RoomsPage from './RoomsPage';

export default class LoginPage {
  readonly page: Page;
  readonly usernameTextbox: Locator;
  readonly passwordTextbox: Locator;
  readonly loginButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.usernameTextbox = page.getByRole('textbox', { name: 'Username' });
    this.passwordTextbox = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async login(username: string, password: string) {
    await this.goToAdminLoginPage();
    await this.fillUsername(username);
    await this.fillPassword(password);
    return await this.clickLoginButton();
  }

  async goToAdminLoginPage() {
    await this.page.goto('/#/admin');
  }

  async fillUsername(username: string) {
    await action.fillTextbox(this.usernameTextbox, username, 'username');
  }

  async fillPassword(password: string) {
    await action.fillTextbox(this.passwordTextbox, password, 'password');
  }

  async clickLoginButton() {
    await action.click(this.loginButton, 'login button');

    const roomsPage = new RoomsPage(this.page);
    return roomsPage;
  }
}
