import path from 'path';
import puppeteer from 'puppeteer';
import encodeQR from '@paulmillr/qr';
import { MyTeemioDocument } from '../models/MyTeemio';
import { createTeemioHTMLTemplateOne } from './PDFTemplates/teemioTemplateOne';

export async function generatePdf(teemio: MyTeemioDocument, teemioActivityNames: string[]) {
  const pdfDocRaw = await createTeemioHTMLTemplateOne(teemio, teemioActivityNames);
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

      const versionNumber = new Date().getTime();

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      const filePath = path.join(import.meta.dir, `../../TeemioEventPDFs/teemio-${teemio.id}V${versionNumber}.pdf`);
      const filesize = await Bun.write(filePath, pdf);

      if (filesize <= 0) {
        throw new Error('The filesize of the PDF generated was 0!');
      }

      return pdf;
    } catch (error) {
      throw new Error(`There was and error generating the pdf: ${error}`);
    } finally {
      browser.close();
    }
  }
}

export async function generateQRCode(teemioUrl: string) {
  const baseUrl = 'https://teemio.dk/myteemio/';
  return encodeQR(`${baseUrl + teemioUrl}`, 'svg');
}
