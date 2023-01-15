import fs from 'fs';
import log4js from 'log4js';

class LanguageManager {
  public locales: string[] = [];
  public localeJSON: Record<string, string> = {};
  public localeObj: Record<string, Record<string, string>> = {};
  private logger = log4js.getLogger('LanguageManager');

  constructor() {
    this.reloadFile();
  }

  public reloadFile() {
    const locales = fs
      .readdirSync('./locales')
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.slice(0, -5));
    this.locales = locales;

    for (const locale of locales) {
      const localeJSON = fs.readFileSync(`./locales/${locale}.json`, 'utf8');
      this.localeJSON[locale] = localeJSON;
      this.localeObj[locale] = JSON.parse(localeJSON);
    }
    this.logger.info(`Successfully loaded ${locales.length} locales`);
  }

  public t(
    lang: string,
    key: string,
    replace?: Record<string, string>
  ): string {
    try {
      const keyArr = key.split('.');
      let localeObj: Record<string, unknown>;
      let result: string;

      if (!this.locales.includes(lang)) {
        lang = 'en-US';
      }

      localeObj = this.localeObj[lang] as Record<string, unknown>;

      for (let i = 0; i < keyArr.length - 1; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        localeObj = localeObj[keyArr[i]!] as Record<string, unknown>;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result = localeObj[keyArr[keyArr.length - 1]!] as string;

      if (replace) {
        for (const [key, value] of Object.entries(replace)) {
          result = result.replace(`{{${key}}}`, value);
        }
      }

      return result;
    } catch (e) {
      return 'Failed to load translation';
    }
  }
}

export const i18n = new LanguageManager();