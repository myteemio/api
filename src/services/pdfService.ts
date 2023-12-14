import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { MyTeemioDocument } from '../models/MyTeemio';
import { findActivityById } from './activityService';
import { findTeemioById } from './myTeemioService';

export async function createTeemioHTMLTemplateOne(teemio: MyTeemioDocument) {
  var pdfAsString = await fs.readFile(path.join(import.meta.dir, '../temp/teemioTemplateOne.html'));

  var $ = cheerio.load(pdfAsString);

  // There is a title
  if (teemio.eventinfo.name) {
    $('.event-title').text(teemio.eventinfo.name);
  }
  console.log($('.event-title').contents().text());

  // There is a description
  if (teemio.eventinfo.description) {
    $('.event-description').text(teemio.eventinfo.description);
  }
  console.log($('.event-description').contents().text());

  // There is an image
  //TODO: add this

  // There is activities to vote for
  if (teemio.activities) {
    const activities = teemio.activities.length > 4 ? teemio.activities.slice(0, 4) : teemio.activities;
    activities.forEach(async (activity) => {
      if (typeof activity.activity === 'string') {
        const foundActivity = await findActivityById(activity.activity);
        $('vote-list-activities').append(`<li>${foundActivity?.name}</li>`);
      } else {
        $('vote-list-activities').append(`<li>${activity.activity.name}</li>`);
      }
    });

    if (teemio.activities.length > 4) {
      $('vote-list-activities').append(`<li>... and ${teemio.activities.length - 4} more</li>`);
    }
  }

  // There is dates to vote for

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
