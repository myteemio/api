import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { MyTeemioDocument } from '../models/MyTeemio';
import { findActivityById } from './activityService';
import { findTeemioById } from './myTeemioService';
import { dateToWeekday } from '../util/date';

const baseUrl = 'https://teemio.dk/myteemio/';

export async function createTeemioHTMLTemplateOne(teemio: MyTeemioDocument) {
  var pdfAsString = await fs.readFile(path.join(import.meta.dir, '../temp/teemioTemplateOne.html'));

  var $ = cheerio.load(pdfAsString);

  if (teemio.eventinfo.name) {
    $('.event-title').text(teemio.eventinfo.name);
  }

  if (teemio.eventinfo.description) {
    $('.event-description').text(teemio.eventinfo.description);
  }

  if (teemio.eventinfo.logo) {
    //TODO: Get image from database
    const imageBufferEventImage = await fs.readFile(path.join(import.meta.dir, '../public/people.jpg'));
    const imageAsBase64EventImage = imageBufferEventImage.toString('base64');
    $('.event-image').attr('src', `data:image/jpg;base64,${imageAsBase64EventImage}`);
  }

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

  if (teemio.dates) {
    const dates = teemio.dates.length > 4 ? teemio.dates.slice(0, 4) : teemio.dates;

    for (const date of dates) {
      $('.vote-list-dates').append(`<li>${dateToWeekday(date.date)}</li>`);
    }

    if (teemio.dates.length > 4) {
      $('.vote-list-dates').append(`<li>... og ${teemio.dates.length - 4} mere</li>`);
    }
  }

  if (teemio.eventinfo.url) {
    await generateQRCode(teemio.eventinfo.url);

    $('.link').text(baseUrl + teemio.eventinfo.url);
    try {
      const imageBufferQr = await fs.readFile(path.join(import.meta.dir, '../public/teemioScreen.png'));
      const imageAsBase64Qr = imageBufferQr.toString('base64');
      $('.qr-code').attr('src', `data:image/png;base64,${imageAsBase64Qr}`);

      const imageBufferQrLogo = await fs.readFile(path.join(import.meta.dir, '../public/teemioLogo.png'));
      const imageAsBase64QrLogo = imageBufferQrLogo.toString('base64');
      $('.qr-logo').attr('src', `data:image/png;base64,${imageAsBase64QrLogo}`);
    } catch (error) {
      console.error('There was an error reading the image!', error);
    }
  }

  // Remove the src from images
  const rootWithoutImages = $.root().clone();
  const imagesIndocument = rootWithoutImages.find('img');
  imagesIndocument.each((i, el) => {
    $(el).attr('src', 'none');
  });

  return {
    htmlWithImages: $.html(),
    htmlWithoutImages: rootWithoutImages.html(),
  };
}

export async function generatePdf(id: string) {
  const teemio = await findTeemioById(id);
  const pdfDocRaw = await createTeemioHTMLTemplateOne(teemio as MyTeemioDocument);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  if (pdfDocRaw) {
    try {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setContent(pdfDocRaw.htmlWithImages, {
        waitUntil: 'domcontentloaded',
      });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      });
      const versionNumber = await getTeemioPdfVersionNumber(id);
      await fs.writeFile(`teemioPDFs/teemio-${id}V${versionNumber}.pdf`, pdf);
      return pdf;
    } catch (error) {
      console.error('There was an error generating the PDF!', error);
    } finally {
      browser.close();
    }
  }
}

export async function getTeemioPdfVersionNumber(id: string) {
  let versionNumber = 0;
  let exists = await fs.exists(`teemioPDFs/teemio-${id}V${versionNumber}.pdf`);
  while (exists) {
    versionNumber++;
    exists = await fs.exists(`teemioPDFs/teemio-${id}V${versionNumber}.pdf`);
  }
  return versionNumber;
}

export async function generateQRCode(teemioUrl: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto('https://www.qrcode-monkey.com/', {
      waitUntil: 'domcontentloaded',
    });
    // Set the value of the input field
    await page.$eval(
      '#qrcodeUrl',
      (el, value) => {
        el.value = value;
        // Manually trigger Angular's change detection
        el.dispatchEvent(new Event('input', { bubbles: true }));
      },
      `${baseUrl + teemioUrl}`
    );
    await (await page.$('#qrcodeUrl'))?.press('Enter'); // Enter Key
    await page.click('#button-create-qr-code', { delay: 1000 });
    const imgSrc = await page.$eval('.preview img[src]', (img) => img.getAttribute('src'));
    await page.goto(`https:${imgSrc}`);

    // Define the dimensions of the screenshot area
    const clip = {
      x: 50,
      y: 50,
      width: 1050,
      height: 1050,
    };

    await page.screenshot({ path: path.join(import.meta.dir, '../public/teemioScreen.png'), clip });
  } catch (error) {
    console.error('There was an error generating the QRCode!', error);
  } finally {
    browser.close();
  }
}
