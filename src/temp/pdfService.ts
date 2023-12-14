// @ts-nocheck
if (templateNumber === 1) {
  pdfDocRaw = await createHTMLResumeTemplateOne(resume);
}

if (pdfDocRaw.htmlWithImages && pdfDocRaw.htmlWithoutImages) {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--disable-dev-shm-usage', '--no-sandbox'] });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setContent(pdfDocRaw.htmlWithImages, {
      waitUntil: 'domcontentloaded',
    });

    await page.pdf({
      path: path.join(pdfPath, pdfNameRaw),
      format: 'A4',
      printBackground: true,
    });

    await this.saveThumbnailImage(pdfPath, pdfNameRaw, thumbnailName);
    const createdPDF = await this.generatePDF(pdfPath, pdfNameRaw, pdfName, resume, 'resume');

    resolve({
      fullPDF: {
        fileName: pdfName,
        htmlRep: pdfDocRaw.htmlWithoutImages, // No JSON representation
      },
      rawPDF: {
        fileName: pdfNameRaw,
        htmlRep: pdfDocRaw.htmlWithoutImages, // No JSON representation
      },
      thumbnail: thumbnailName,
    });
  } catch (error) {
    console.error('There was an error generating the PDF!', error);
    reject('There was an error generating the PDF!');
  }
} else {
  reject('We could not find template!');
}