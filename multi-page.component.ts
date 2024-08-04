import { Component } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-page',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './multi-page.component.html',
  styleUrls: ['./multi-page.component.scss']
})
export class MultiPageComponent {
  name = 'Angular Modify PDF';
  apiData: any[] = [];
  selectedItems: any[] = [];

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.apiData = await this.fetchApiData();
  }

  async modifyPdf() {
    const existingPdfBytes = await fetch('/assets/template.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    for (const [index, item] of this.selectedItems.entries()) {
      const [templatePageClone] = await pdfDoc.copyPages(pdfDoc, [0]);
      if (index === 0) {
        // If it's the first page, clear the original template content and draw on it
        const firstPage = pdfDoc.getPage(0);
        this.drawTextOnPage(firstPage, item);
      } else {
        // For subsequent pages, add the cloned page and draw on it
        pdfDoc.addPage(templatePageClone);
        this.drawTextOnPage(templatePageClone, item);
      }
    }

    const pdfBytes = await pdfDoc.save();
    this.downloadPdf(pdfBytes);
  }

  private drawTextOnPage(page: any, item: any) {
    page.drawText(`Title: ${item.title}`, {
      x: 50,
      y: 700,
      size: 20,
      color: rgb(0, 0.53, 0.71),
    });
    page.drawText(`Category: ${item.category}`, {
      x: 50,
      y: 650,
      size: 20,
      color: rgb(0, 0.53, 0.71),
    });
    page.drawText(`Price: $${item.price}`, {
      x: 50,
      y: 600,
      size: 20,
      color: rgb(0, 0.53, 0.71),
    });
    page.drawText(`Description: ${item.description}`, {
      x: 50,
      y: 550,
      size: 20,
      color: rgb(0, 0.53, 0.71),
    });
  }

  private async fetchApiData(): Promise<any[]> {
    const apiUrl = 'https://fakestoreapi.com/products';
    return firstValueFrom(this.http.get<any[]>(apiUrl));
  }

  private downloadPdf(pdfBytes: Uint8Array) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onCheckboxChange(event: any, item: any) {
    if (event.target.checked) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    }
  }
}
