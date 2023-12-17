import path from 'path';
import puppeteer from 'puppeteer';
import { MyTeemioDocument } from '../models/MyTeemio';
import { createTeemioHTMLTemplateOne } from './PDFTemplates/teemioTemplateOne';

export async function generatePdf(teemio: MyTeemioDocument) {
  const pdfDocRaw = await createTeemioHTMLTemplateOne(teemio);
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

      const versionNumber = new Date().getUTCSeconds();

      const pdf = await page.pdf({
        path: path.join(import.meta.dir, `../../TeemioEventPDFs/teemio-${teemio.id}V${versionNumber}.pdf`),
        format: 'A4',
        printBackground: true,
      });

      return pdf;
    } catch (error) {
      console.error('There was an error generating the PDF!', error);
    } finally {
      browser.close();
    }
  }
}

export async function generateQRCode(teemioUrl: string) {
  const baseUrl = 'https://teemio.dk/myteemio/';
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
