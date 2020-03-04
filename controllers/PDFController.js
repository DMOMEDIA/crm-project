const hummus = require('hummus');
  PDFDigitalForm = require('./pdf-digital-form');
const pdfFiller = require('pdffiller');
const fs = require('fs');

var data = {
  "nr_zapytania": "0056/2019",
  "c_name": "DMO Trans Daniel Ostałowski"
};

exports.parseFields = (sourcePDF) => {
  var pdfParser = hummus.createReader(sourcePDF),
  df = new PDFDigitalForm(pdfParser);

  if(df.hasForm()) {
    console.log(JSON.stringify(df.fields, null, 4));
  }
};

exports.fillPDF = (sourcePDF, destPDF, data) => {
  return new Promise((resolve, reject) => {
    pdfFiller.fillFormWithFlatten(sourcePDF, destPDF, data, false, function(err) {
      if (err) reject(err);
      resolve();
    });
  });
};

//exports.parseFields('./build/pdf_files/rent_draft.pdf');
//exports.fillPDF('./build/pdf_files/rent_draft.pdf', './test.pdf', data);
