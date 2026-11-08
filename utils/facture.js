const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.genererFacture = (vente, client, lignes) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `facture-${vente.numeroFacture}.pdf`;
    const filepath = path.join(__dirname, '../public/factures', filename);
    
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // En-tête bleu arrondi style
    doc.rect(0, 0, 595, 150).fill('#3e5ba4');
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('GESTION BOUTIQUE', 50, 40);
    doc.fontSize(10).font('Helvetica').text('PRO', 50, 70);
    doc.fontSize(9).text('Boutique Commerciale', 450, 40, { width: 95, align: 'right' });
    doc.text('Tel: +XXX XXX XXX XXX', 450, 55, { width: 95, align: 'right' });
    doc.text('contact@boutique.com', 450, 70, { width: 95, align: 'right' });
    
    doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('FACTURÉ À', 50, 170);
    if (client) {
      doc.fontSize(10).font('Helvetica').text(`${client.prenom} ${client.nom}`, 50, 190);
      doc.text(client.telephone, 50, 205);
    } else {
      doc.text('Client Anonyme', 50, 190);
    }
    
    doc.font('Helvetica-Bold').text('N° FACTURE', 350, 170);
    doc.font('Helvetica').text(vente.numeroFacture, 350, 190);
    doc.font('Helvetica-Bold').text('DATE', 450, 170);
    doc.font('Helvetica').text(new Date(vente.dateVente).toLocaleDateString('fr-FR'), 450, 190);
    doc.text(new Date(vente.dateVente).toLocaleTimeString('fr-FR'), 450, 205);
    
    // Tableau
    let y = 250;
    doc.rect(50, y, 495, 25).fill('#eeeeee');
    doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold');
    doc.text('N°', 60, y + 8);
    doc.text('DÉSIGNATION', 90, y + 8);
    doc.text('PRIX UNITAIRE', 320, y + 8);
    doc.text('QTÉ', 420, y + 8);
    doc.text('MONTANT', 480, y + 8);
    
    y += 30;
    doc.font('Helvetica').fillColor('#555555');
    lignes.forEach((ligne, idx) => {
      doc.text((idx + 1) + '.', 60, y);
      doc.text(ligne.designation.substring(0, 35), 90, y);
      doc.text(ligne.prixUnitaire.toLocaleString() + ' UM', 320, y);
      doc.text(ligne.quantite.toString(), 420, y);
      doc.text(ligne.montantLigne.toLocaleString() + ' UM', 480, y);
      y += 18;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#f0f0f0').stroke();
      y += 5;
    });
    
    y += 20;
    doc.font('Helvetica').fillColor('#333333');
    doc.text('Sous-total:', 400, y);
    doc.text(vente.sousTotal.toLocaleString() + ' UM', 480, y);
    y += 15;
    if (vente.remise > 0) {
      doc.text('Remise:', 400, y);
      doc.text('- ' + vente.remise.toLocaleString() + ' UM', 480, y);
      y += 15;
    }
    doc.rect(400, y, 145, 25).fill('#3e5ba4');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12);
    doc.text('TOTAL', 410, y + 7);
    doc.text(vente.total.toLocaleString() + ' UM', 480, y + 7);
    
    y += 60;
    doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold').text('INFORMATIONS', 50, y);
    y += 15;
    doc.font('Helvetica').text('Mode de paiement: ' + vente.modePaiement, 50, y);
    y += 12;
    doc.text('Type: ' + vente.typeVente, 50, y);
    
    doc.fontSize(10).text('Signature & Cachet', 420, y + 40);
    doc.moveTo(400, y + 55).lineTo(545, y + 55).strokeColor('#cccccc').stroke();
    
    doc.rect(150, 750, 295, 25).fill('#3e5ba4');
    doc.fillColor('#ffffff').fontSize(11).text('Merci de votre confiance !', 0, 757, { align: 'center', width: 595 });
    
    doc.end();
    
    stream.on('finish', () => {
      resolve({ filename, filepath });
    });
    stream.on('error', reject);
  });
};
