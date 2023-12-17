import path from 'path';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { MyTeemioDocument } from '../../models/MyTeemio';
import { findActivityById } from '../activityService';
import { dateToWeekday } from '../../util/date';

const baseUrl = 'https://teemio.dk/myteemio/';

export async function createTeemioHTMLTemplateOne(teemio: MyTeemioDocument) {
  var pdfAsString = await fs.readFile(path.join(import.meta.dir, './PDFTemplates/teemioTemplateOne.html'));

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
    // await generateQRCode(teemio.eventinfo.url);

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
