// @ts-nocheck
import path from 'path';
import { Resume } from 'src/schemas/resume.schema';
import fs from 'fs/promises';
import * as cheerio from 'cheerio';

export async function createHTMLResumeTemplateOne(resume: Resume): Promise<{ htmlWithImages: string; htmlWithoutImages: string }> {
  var pdfAsString = await fs.readFile(path.join(__dirname, './ResumeTemplateOne.html'));

  var $ = cheerio.load(pdfAsString);

  if (resume.userInformation.imagePath) {
    // There is an image
    $('#profileimageastext').css('display', 'none');
    $('#profileimage').css('display', 'block');

    const imagePath = path.join(__dirname, '../../../', 'userProfileImages', resume.connectedUser._id.toString(), resume.userInformation.imagePath);
    const imageAsBase64 = await fs.readFile(imagePath, {
      encoding: 'base64',
    });
    $('#profileimage').attr('src', `data:image/jpeg;charset=utf-8;base64,${imageAsBase64}`);
  } else {
    $('#profileimage').css('display', 'none');
  }

  $('#aboutyourself').text(resume.presentation);

  {
    // Add the skills
    const skillscontainer = $('#skillscontainer');
    const oneskilltemplate = $('#oneskill').clone();
    // Remove current skills
    skillscontainer.children('.oneskill').remove();

    resume.skills.forEach((v, i) => {
      const skillToAdd = oneskilltemplate.clone();
      skillToAdd.find('#skillname').text(v.title);
      skillToAdd.find('#skilllevel').css('width', `${v.level}%`);
      skillscontainer.prepend(skillToAdd);
    });
  }

  {
    // Add personal info
    $('#fullname').text(resume.userInformation.name);
    $('#address').text(
      `${resume.userInformation.address1 ? resume.userInformation.address1 + (resume.userInformation.address2 ? ', ' : '') : ''}${resume.userInformation.address2 ?? ''}`,
    );

    $('#zipandcity').text(
      `${resume.userInformation.zipcode ? resume.userInformation.zipcode + (resume.userInformation.city ? ', ' : '') : ''}${resume.userInformation.city ?? ''}`,
    );
    $('#phone').text(resume.userInformation.phone ?? '');
    $('#email').text(resume.userInformation.email ?? '');
  }

  {
    // Add experiences

    if (resume.experiences.length > 0) {
      const expcontainer = $('#experiences');
      const oneexperiencetemplate = $('#oneexperience').clone();
      // Remove current experiences
      expcontainer.children('.experience').remove();

      resume.experiences.forEach((v, i) => {
        const toAdd = oneexperiencetemplate.clone();
        toAdd.find('#experiencetitle').text(`${v.title} (${v.from}-${v.to})`);
        toAdd.find('#experiencedesc').text(v.description);
        expcontainer.prepend(toAdd);
      });
    } else {
      $('#experiencecontainer').css('display', 'none');
    }
  }

  {
    // Add laeringsbeviser
    if (resume.laeringsCertificates && resume.laeringsCertificates.length > 0) {
      const laeringsbeviscontainer = $('#laeringsbeviserlist');
      const onelaeringsbevistemp = $('#onelaeringsbevis').clone();
      // Remove current laeringsbeviser
      laeringsbeviscontainer.children('li').remove();

      resume.laeringsCertificates.forEach((v, i) => {
        const toAdd = onelaeringsbevistemp.clone();
        toAdd.text(v.courseName);
        laeringsbeviscontainer.prepend(toAdd);
      });
    } else {
      $('#laeringsbeviser').css('display', 'none');
    }
  }

  {
    if (resume.educations.length > 0) {
      // Add education
      const educationcontainer = $('#educationcontainer');
      const oneeducationtemplate = $('#oneeducation').clone();
      // Remove current educations
      educationcontainer.children('.experience').remove();

      resume.educations.forEach((v, i) => {
        const toAdd = oneeducationtemplate.clone();
        toAdd.find('#educationtitle').text(`${v.title}`);
        toAdd.find('#educationdesc').text(`${v.type === 'education' ? 'Uddannelse' : 'Kursus'} (${v.from}-${v.to})`);
        educationcontainer.prepend(toAdd);
      });
    } else {
      $('#eudcationcontainerlarge').css('display', 'none');
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