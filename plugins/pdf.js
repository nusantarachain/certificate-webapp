// const PDFDocument = require('pdfkit')

const svgToPdfKit = require('svg-to-pdfkit')
const QRCode = require('qrcode')

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return svgToPdfKit(this, svg, x, y, options), this
}

async function generateQrCode(content) {
  const result = new Promise((resolve, reject) => {
    QRCode.toString(
      content,
      {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 0,
        width: 90,
        mode: 'alphanumeric',
        // color: "#219436"
        color: {
          dark: '#000000',
          light: '#FFFFFFFF',
        },
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
  })

  return result
}

export default async ({ app }, inject) => {
  async function processPage(doc, p, org, options) {
    let resp = await $nuxt.$nuchain.getIssuedCertificate(p.onchainId)

    if (!resp) {
      console.log('Cannot get issued data from chain')
      return
    }

    const issued = resp.toHuman()
    const issuedDate = app.$util.formatDate(new Date(resp.toJSON().time))

    resp = await $nuxt.$nuchain.getCertificate(issued.cert_id)

    if (!resp) {
      console.log('Cannot get cert with id:', issued.cert_id)
      return
    }

    const cert = resp.toHuman()

    const alignCenter = { align: 'center' }

    doc.addPage()

    if (!options.qrCodeOnly) {
      doc.font('Times-Roman')
      let title = `${org.name}`
      doc.fontSize(25).text(title, options.left, options.top, alignCenter)

      const recipientNamePosTop =
        options.top + parseInt(process.env.pdfRecipientNamePosTop)

      doc
        .font('Times-Roman', 21)
        .text(cert.name, options.left, options.top + 30, alignCenter)
        .font('Times-Roman', 13)
        .text(
          issued.human_id,
          options.left,
          parseInt(process.env.pdfRefIdPosTop),
          {
            height: 300,
            ellipsis: true,
            ...alignCenter,
          }
        )
        .moveDown()
        .font('Times-Roman', 15)
        .text('Diberikan kepada:', alignCenter)
        .font('Times-Roman', 21)
        .text(issued.recipient, options.left, recipientNamePosTop + 50, {
          ...alignCenter,
          underline: true,
        })
        .font('Times-Roman', 15)
        .text(
          `${issuedDate}`,
          options.left,
          recipientNamePosTop + 75,
          alignCenter
        )

      // --- place signer name ---

      console.log('process.env.pdfMarginLeft:', process.env.pdfMarginLeft)

      doc.text(
        cert.signer_name,
        options.left + parseInt(process.env.pdfSignerNamePosLeft),
        370,
        { underline: true }
      )
    }

    // --- place QR-Code ---

    let qrcode = await generateQrCode(
      `${process.env.proofBaseUrl}/?i=${p.onchainId}`
    )

    doc.addSVG(qrcode, options.qrcode.left, options.qrcode.top, {})
    doc
      .font('Courier', 10)
      .text(p.onchainId, options.qrcode.left, options.qrcode.top + 70)
  }

  async function generate(p, org, options) {
    if (!p || !p.onchainId) {
      return
    }

    console.log('generating PDF document', p)
    // create a document and pipe to a blob
    var doc = new PDFDocument({
      autoFirstPage: false,
      size: process.env.pdfPageSize,
      layout: 'landscape',
    })
    var stream = doc.pipe(blobStream())

    await processPage(doc, p, org, options)

    doc.end()

    stream.on('finish', function () {
      // iframe.src = stream.toBlobURL('application/pdf')
      // let blob = new Blob([stream], {type: "application/pdf"});
      // let blob = stream.toBlobURL('application/pdf');
      // let url = window.URL.createObjectURL(blob);

      // var iframe = document.querySelector('iframe')
      // iframe.src = stream.toBlobURL('application/pdf')

      // window.open(iframe.src, '_blank')

      window.open(stream.toBlobURL('application/pdf'))
    })
  }

  async function generateBatched(ps, org, options) {
    if (!ps || ps.length == 0) {
      return
    }
    console.log('generating batched PDF documents')
    // create a document and pipe to a blob
    var doc = new PDFDocument({
      autoFirstPage: false,
      size: process.env.pdfPageSize,
      layout: 'landscape',
    })
    var stream = doc.pipe(blobStream())

    for (var i = 0; i < ps.length; i++) {
      let p = ps[i]
      console.log('🚀 ~ file: pdf.js ~ line 180 ~ generateBatched ~ p', p)
      await processPage(doc, p, org, options)
    }

    doc.end()

    stream.on('finish', function () {
      // iframe.src = stream.toBlobURL('application/pdf')
      // let blob = new Blob([stream], {type: "application/pdf"});
      // let blob = stream.toBlobURL('application/pdf');
      // let url = window.URL.createObjectURL(blob);

      // var iframe = document.querySelector('iframe')
      // iframe.src = stream.toBlobURL('application/pdf')

      // window.open(iframe.src, '_blank')

      window.open(stream.toBlobURL('application/pdf'))
    })
  }

  inject('pdf', {
    generate,
    generateBatched,
  })
}
