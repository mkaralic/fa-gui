import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaApiService {
  uploadId: string = '';
  // koristimo HttpClient i Socket za komunikaciju sa serverom
  // socket ce nam sluziti za primanje realtime obavestenja o statusu uploada i promenama u listi fajlova
  // socket objekat se kreira i povezuje na server na URL: http://localhost:5000, naveden u konfiguraciji SocketIoModule u app.module.ts
  constructor(private http: HttpClient, private socket: Socket) { }

  getFileList(): Observable<{ files: string[] }> {
    return this.http.get<{ files: string[] }>('http://localhost:5000');
  }

  // funkcija za upload fajla
  uploadFile(file: File): Observable<any> {
    this.uploadId = Date.now().toString();
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let currentChunk = 0;

    // funkcija koja rekurzivno uploaduje chunkove fajla
    const uploadChunk = (start: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, file.name);
        formData.append('chunkIndex', currentChunk.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('uploadId', this.uploadId);

        // post metodom saljemo chunk na server
        this.http.post('http://localhost:5000', formData).subscribe({
          // ako je chunk uspesno uploadovan, pozivamo sledeci chunk
          next: () => {
            currentChunk++;
            if (currentChunk < totalChunks) {
              // razresavamo Promise od slanja sledeceg chunka
              resolve(uploadChunk(end));
            } else {
              // ako su svi chunkovi uploadovani, razresavamo Promise od uploada
              resolve('Upload complete');
            }
          },
          error: (err) => reject(err),
        });
      });
    };

    return new Observable(observer => {
      uploadChunk(0)
        .then(() => {
          observer.next({ status: 'upload_completed' });
          observer.complete();
        })
        .catch(error => {
          observer.error({ status: 'upload_failed', error });
        });
    });
  }

  downloadFileUrl(fileName: string): string {
    return `http://localhost:5000/download/${fileName}`;
  }

  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`http://localhost:5000/${filename}`);
  }

  // funkcija za realtime pracenje statusa uploada
  onStatusUpdate(): Observable<any> {
    // koristimo fromEvent metodu Socket klase da bismo se pretplatili na dogadjaje sa servera
    return this.socket.fromEvent('status').pipe(filter((data: any) => data.uploadId === this.uploadId));
  }

  onFileListUpdated(): Observable<any> {
    return this.socket.fromEvent('file_list_updated');
  }
}
