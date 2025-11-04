import { LaunchOptions } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const browserOptions: LaunchOptions = {
  slowMo: 0,
  headless: !process.env.HEADED,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true
  }
};

export const config = {
  browser: process.env.BROWSER ?? 'chromium',
  browserOptions,
  BASE_URL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  IMG_THRESHOLD: { threshold: 0.4 },
  BASE_API_URL: process.env.API_BASE_URL || 'http://localhost:8080'
};
