import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { MyTeemioDocument } from '../models/MyTeemio';
import { findActivityById } from './activityService';
import { findTeemioById } from './myTeemioService';
import { dateToWeekday } from '../util/date';

export async function createTeemioHTMLTemplateOne(teemio: MyTeemioDocument) {
  var pdfAsString = await fs.readFile(path.join(import.meta.dir, '../temp/teemioTemplateOne.html'));

  var $ = cheerio.load(pdfAsString);

  // There is a title
  if (teemio.eventinfo.name) {
    $('.event-title').text(teemio.eventinfo.name);
  }

  // There is a description
  if (teemio.eventinfo.description) {
    $('.event-description').text(teemio.eventinfo.description);
  }

  // There is an image
  //TODO: add this

  //There is activities to vote for
  if (teemio.activities) {
    const activities = teemio.activities.length > 4 ? teemio.activities.slice(0, 4) : teemio.activities;

    for (const activity of activities) {
      //Activity is reference
      if (typeof activity.activity === 'string') {
        const foundActivity = await findActivityById(activity.activity);
        $('.vote-list-activities').append(`<li>${foundActivity?.name}</li>`);
      } else {
        //Activity is custom
        $('.vote-list-activities').append(`<li>${activity.activity.name}</li>`);
      }
    }

    if (teemio.activities.length > 4) {
      $('.vote-list-activities').append(`<li>... og ${teemio.activities.length - 4} mere</li>`);
    }
  }

  // There is dates to vote for
  if (teemio.dates) {
    const dates = teemio.dates.length > 4 ? teemio.dates.slice(0, 4) : teemio.dates;

    for (const date of dates) {
      $('.vote-list-dates').append(`<li>${dateToWeekday(date.date)}</li>`);
    }

    if (teemio.dates.length > 4) {
      $('.vote-list-dates').append(`<li>... og ${teemio.dates.length - 4} mere</li>`);
    }
  }

  // There is a link

  return $.html();
}

export async function generatePdf() {
  const teemio = await findTeemioById('656f7f5136dd78f8d5859eab');
  const pdfDocRaw = await createTeemioHTMLTemplateOne(teemio as MyTeemioDocument);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  if (pdfDocRaw) {
    try {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setContent(pdfDocRaw, {
        waitUntil: 'domcontentloaded',
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await fs.writeFile(path.join(import.meta.dir, '../pdf/teemio.pdf'), pdf);
    } catch (error) {
      console.error('There was an error generating the PDF!', error);
    } finally {
      browser.close();
    }
  }
}
