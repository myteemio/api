import path from 'path';
import * as cheerio from 'cheerio';
import { MyTeemioDocument } from '../../models/MyTeemio';
import { dateToWeekday } from '../../util/date';
import { generateQRCode } from '../pdfService';

const baseUrl = 'https://teemio.dk/myteemio/';

export async function createTeemioHTMLTemplateOne(teemio: MyTeemioDocument, teemioActivityNames: string[]) {
  const pdfFile = Bun.file(path.join(import.meta.dir, './teemioTemplateOne.html'));

  var $ = cheerio.load(await pdfFile.text());

  if (teemio.eventinfo.name) {
    $('.event-title').text(teemio.eventinfo.name);
  }

  if (teemio.eventinfo.description) {
    $('.event-description').text(teemio.eventinfo.description);
  }

  if (teemio.eventinfo.logo) {
    //TODO: Get image from database
    const EventImageFile = Bun.file(path.join(import.meta.dir, '../../public/people.jpg'));
    const imageAsBase64EventImage = Buffer.from(await EventImageFile.arrayBuffer()).toString('base64');
    $('.event-image').attr('src', `data:image/jpg;base64,${imageAsBase64EventImage}`);
  }

  if (teemioActivityNames) {
    teemioActivityNames.length > 4 ? teemioActivityNames.slice(0, 4) : teemioActivityNames;
    for (const activity of teemioActivityNames) {
      $('.vote-list-activities').append(`<li>${activity}</li>`);
    }
    
    if (teemioActivityNames.length > 4) {
      $('.vote-list-activities').append(`<li>... og ${teemioActivityNames.length - 4} mere</li>`);
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
    const qrCode = await generateQRCode(teemio.eventinfo.url);
    $('.link').text(baseUrl + teemio.eventinfo.url);
    $('.qr-code').html(qrCode);
    const QrCodeLogo = Bun.file(path.join(import.meta.dir, '../../public/teemioLogo.png'));
    const QrCodeLogoBase64 = Buffer.from(await QrCodeLogo.arrayBuffer()).toString('base64');
    $('.qr-logo').attr('src', `data:image/png;base64,${QrCodeLogoBase64}`);
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
