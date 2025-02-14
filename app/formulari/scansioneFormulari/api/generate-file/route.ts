import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises, existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Parsing del payload JSON
    const { fir, documentType, selectedImages } = await request.json();
    if (!fir || !documentType || !selectedImages || !Array.isArray(selectedImages) || selectedImages.length === 0) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Definisce le directory di lavoro
    const workingTempDir = path.join(process.cwd(), 'working-temp');
    const outputDir = path.join(workingTempDir, 'output');
    if (!existsSync(outputDir)) {
      await fsPromises.mkdir(outputDir, { recursive: true });
    }

    // Percorso del file JSON aggiornato
    const resultsWorkingPath = path.join(workingTempDir, 'risultati-working.json');
    let resultsJson: any = {};
    try {
      const jsonContent = await fsPromises.readFile(resultsWorkingPath, 'utf-8');
      resultsJson = JSON.parse(jsonContent);
    } catch (err) {
      resultsJson = { percorsi_file: {} };
    }
    if (!resultsJson.percorsi_file) {
      resultsJson.percorsi_file = {};
    }

    // Determina il percorso di destinazione per il PDF
    let targetFilePath = "";
    if (resultsJson.percorsi_file[fir] && resultsJson.percorsi_file[fir][documentType]) {
      targetFilePath = resultsJson.percorsi_file[fir][documentType];
    } else {
      const safeDocumentType = documentType.replace(/\s+/g, '_');
      const fileName = `${fir}_${safeDocumentType}.pdf`;
      targetFilePath = path.join(outputDir, fileName);
    }

    // Crea un nuovo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Per ciascuna immagine selezionata
    for (const url of selectedImages) {
      const urlObj = new URL("http://dummy" + url);
      const encodedFilePath = urlObj.searchParams.get('file');
      if (!encodedFilePath) continue;
      const localFilePath = decodeURIComponent(encodedFilePath);
      
      try {
        // Leggi l'immagine come Buffer
        const imageBytes = await fsPromises.readFile(localFilePath);
        
        // Aggiungi una nuova pagina A4
        const page = pdfDoc.addPage([595, 842]); // Dimensioni A4 in punti
        
        // Embedded l'immagine nel PDF
        let embeddedImage;
        if (localFilePath.toLowerCase().endsWith('.jpg') || localFilePath.toLowerCase().endsWith('.jpeg')) {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else if (localFilePath.toLowerCase().endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          continue; // Salta i formati non supportati
        }

        // Calcola le dimensioni per il fit
        const { width, height } = embeddedImage.scale(1);
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const margin = 50;
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        let scaleFactor = Math.min(
          maxWidth / width,
          maxHeight / height
        );
        
        const scaledWidth = width * scaleFactor;
        const scaledHeight = height * scaleFactor;
        
        // Centra l'immagine nella pagina
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
        
      } catch (imgErr) {
        console.error("Errore nell'aggiunta dell'immagine:", localFilePath, imgErr);
      }
    }

    // Salva il PDF
    const pdfBytes = await pdfDoc.save();
    await fsPromises.writeFile(targetFilePath, pdfBytes);

    // Aggiorna il file JSON
    if (!resultsJson.percorsi_file[fir]) {
      resultsJson.percorsi_file[fir] = {};
    }
    resultsJson.percorsi_file[fir][documentType] = targetFilePath;
    await fsPromises.writeFile(resultsWorkingPath, JSON.stringify(resultsJson, null, 2), 'utf-8');

    return NextResponse.json({ message: 'File generato con successo', filePath: targetFilePath });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}