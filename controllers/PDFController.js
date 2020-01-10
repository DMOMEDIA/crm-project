const hummus = require('hummus');
  PDFDigitalForm = require('./pdf-digital-form');
const pdfFiller = require('pdffiller');
const fs = require('fs');

var data = {
  "nr_zapytania": "001/I/2019",
  "nazwafirmy": "DMO Trans Daniel Ostałowski",
  "REGON": "4255545664554",
  "NIP": "5092940491",
  "email": "daniel@dmomedia.pl",
  "nazwaprzedmiotu": "ą|ę|ź|ć|ż|ł|ó|ń|ś|"
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

//exports.parseFields('./build/pdf_files/rent-company.pdf');
//exports.fillPDF('./build/pdf_files/leasing-company.pdf', './test.pdf', data);
