
/**
 * Utility to extract text from a PDF file using window.pdfjsLib
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // @ts-ignore
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
}

export async function extractTextFromTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
